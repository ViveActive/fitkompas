-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'coachee' check (role in ('admin', 'coach', 'coachee')),
  coach_id uuid references profiles(id) on delete set null,
  coach_code text unique,
  created_at timestamptz default now()
);

-- Coach subscriptions / credit bundles
create table coach_subscriptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references profiles(id) on delete cascade not null,
  plan text not null check (plan in ('bundle_10', 'bundle_30', 'subscription_monthly', 'subscription_yearly')),
  credits int,
  credits_expire_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Survey sessions
create table survey_sessions (
  id uuid primary key default gen_random_uuid(),
  coachee_id uuid references profiles(id) on delete cascade not null,
  coach_id uuid references profiles(id) on delete set null,
  language text not null default 'nl' check (language in ('nl', 'en')),
  completed_at timestamptz,
  x_score numeric,
  y_score numeric,
  quadrant text check (quadrant in ('active_motivated', 'active_unmotivated', 'inactive_motivated', 'inactive_unmotivated')),
  created_at timestamptz default now()
);

-- Answers
create table answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references survey_sessions(id) on delete cascade not null,
  question_id int not null,
  value numeric not null,
  unique(session_id, question_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table coach_subscriptions enable row level security;
alter table survey_sessions enable row level security;
alter table answers enable row level security;

-- Profiles: eigen profiel lezen/schrijven; coach ziet zijn coachees; admin ziet alles
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "coach sees coachees" on profiles for select using (
  coach_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Subscriptions: coach ziet eigen abonnement; admin ziet alles
create policy "coach subscription" on coach_subscriptions for all using (
  coach_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Sessions: coachee ziet eigen sessies; coach ziet sessies van zijn coachees; admin ziet alles
create policy "session access" on survey_sessions for all using (
  coachee_id = auth.uid() or
  coach_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Answers: zelfde logica via sessie
create policy "answer access" on answers for all using (
  exists (
    select 1 from survey_sessions s where s.id = session_id and (
      s.coachee_id = auth.uid() or
      s.coach_id = auth.uid() or
      exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  )
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'coachee'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
