# Fitkompas — Herbouwdocument

**Eigenaar:** Maarten Schaapherder / ViveActive  
**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase · Stripe  
**Doel:** SaaS-platform waarmee coaches respondenten een 60-vragenlijst laten invullen en hun beweegprofiel zien in een kwadrantenmodel.

---

## 1. Nieuw project opzetten

```bash
npx create-next-app@latest fitkompas \
  --typescript --tailwind --app --src-dir --import-alias "@/*"
cd fitkompas
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
```

Projectstructuur: `src/app` (App Router), `src/components`, `src/lib`, `src/types`.

---

## 2. Omgevingsvariabelen — `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://rjlzikyohkaxalpmuyyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key uit Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service role key uit Supabase dashboard>

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000   # productie: https://jouwdomein.nl

STRIPE_BUNDLE_10_PRICE_ID=price_...
STRIPE_BUNDLE_30_PRICE_ID=price_...
STRIPE_SUB_MONTHLY_PRICE_ID=price_...
STRIPE_SUB_YEARLY_PRICE_ID=price_...
```

---

## 3. Supabase — tabellen

Voer onderstaande SQL uit in de Supabase SQL Editor. Klik altijd **"Run without RLS"** (RLS is uitgeschakeld op alle tabellen).

### 3.1 profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'respondent',   -- 'admin' | 'coach' | 'respondent'
  coach_id uuid references profiles(id),
  coach_code text unique,
  admin_notes text,
  created_at timestamptz default now()
);
```

### 3.2 survey_sessions
```sql
create table survey_sessions (
  id uuid primary key default gen_random_uuid(),
  coachee_id uuid references profiles(id),
  coach_id uuid references profiles(id),
  language text default 'nl',
  completed_at timestamptz,
  x_score numeric,
  y_score numeric,
  quadrant text,
  created_at timestamptz default now()
);
```

### 3.3 answers
```sql
create table answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references survey_sessions(id) on delete cascade,
  question_id int,
  value int,
  created_at timestamptz default now()
);
```

### 3.4 coach_subscriptions
```sql
create table coach_subscriptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references profiles(id),
  plan_type text,   -- 'bundle' | 'subscription'
  plan_name text,   -- 'bundle_10' | 'bundle_30' | 'subscription_monthly' | 'subscription_yearly'
  credits_total int,
  credits_used int default 0,
  expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active',
  created_at timestamptz default now()
);
```

### 3.5 invite_tokens
```sql
create table invite_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  coach_id uuid references profiles(id),
  email text not null,
  used boolean default false,
  used_at timestamptz,
  created_at timestamptz default now()
);
```

### 3.6 groups & profile_groups
```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table profile_groups (
  profile_id uuid references profiles(id),
  group_id uuid references groups(id) on delete cascade,
  primary key (profile_id, group_id)
);
```

### 3.7 pricing_plans
```sql
create table pricing_plans (
  id text primary key,
  name text,
  price text,
  period text,
  description text,
  features jsonb default '[]',
  stripe_price_id text,
  badge text,
  highlight boolean default false,
  sort_order int default 0,
  max_respondents int
);

insert into pricing_plans values
  ('bundle_10',           'Starter',          '€29',  'eenmalig',   'Ideaal om te starten',          '["10 vragenlijsten","Individuele rapportage","1 jaar geldig"]',              null, null,            false, 1, 10),
  ('bundle_30',           'Pro Bundle',        '€69',  'eenmalig',   'Voor actieve coaches',           '["30 vragenlijsten","Individuele + groepsrapportage","1 jaar geldig"]',     null, 'Meest gekozen', true,  2, 30),
  ('subscription_monthly','Maandabonnement',   '€19',  '/maand',     'Flexibel, maandelijks opzegbaar','["Onbeperkt vragenlijsten","Alle rapportages","Prioriteitsondersteuning"]', null, null,            false, 3, null),
  ('subscription_yearly', 'Jaarabonnement',    '€149', '/jaar',      'Meeste voordeel',                '["Onbeperkt vragenlijsten","Alle rapportages","2 maanden gratis"]',          null, 'Beste waarde',  false, 4, null);
```

### 3.8 Admin-account aanmaken
Registreer een gewone gebruiker via `/register`, zoek daarna het uuid op in Supabase → `profiles`, en voer uit:
```sql
update profiles set role = 'admin' where email = 'jouw@email.nl';
```

---

## 4. Supabase Auth instellen

- Providers: **Email** (magic link UIT, wachtwoord AAN)
- Redirect URL toevoegen: `https://jouwdomein.nl/**`
- Email-templates: standaard zijn prima

---

## 5. Stripe instellen

1. Maak 4 producten aan in het Stripe dashboard (test mode):
   - Starter bundle — eenmalig €29
   - Pro Bundle — eenmalig €69
   - Maandabonnement — €19/maand
   - Jaarabonnement — €149/jaar
2. Kopieer de `price_...` IDs naar `.env.local`
3. Webhook instellen op `https://jouwdomein.nl/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
4. Kopieer de webhook signing secret naar `STRIPE_WEBHOOK_SECRET`

---

## 6. Bestandenstructuur

```
src/
├── app/
│   ├── layout.tsx                        # root layout
│   ├── page.tsx                          # landingspagina (publiek)
│   ├── login/page.tsx                    # inlogpagina
│   ├── register/page.tsx                 # respondent registratie (via invite token of coach code)
│   ├── register-coach/page.tsx           # coach registratie (publiek)
│   ├── survey/page.tsx                   # vragenlijst (60 vragen, 1 per keer)
│   ├── pricing/
│   │   ├── page.tsx                      # server component: haalt plans uit DB
│   │   └── PricingContent.tsx            # client component: checkout interactie
│   ├── results/[id]/page.tsx             # resultaatpagina respondent
│   ├── dashboard/
│   │   ├── layout.tsx                    # sidebar + auth guard
│   │   ├── page.tsx                      # overzicht (admin/coach/respondent)
│   │   ├── account/page.tsx              # coach eigen account + creditbalk
│   │   ├── coaches/
│   │   │   ├── page.tsx                  # admin: lijst coaches
│   │   │   ├── CreateCoachForm.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # admin: coach detail
│   │   │       ├── CoachNotes.tsx
│   │   │       └── ProfileGroupManager.tsx
│   │   ├── coachees/
│   │   │   ├── page.tsx                  # coach: lijst respondenten
│   │   │   └── [id]/page.tsx             # respondent detail
│   │   ├── groups/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── GroupMemberManager.tsx
│   │   ├── invite/page.tsx               # uitnodigingen (enkelvoudig + bulk)
│   │   ├── pricing/
│   │   │   ├── page.tsx                  # admin: prijzen beheren
│   │   │   └── PricingEditor.tsx
│   │   ├── register-coach/page.tsx       # na Stripe checkout
│   │   └── reports/page.tsx              # rapportages + groepsfilter
│   └── api/
│       ├── auth/logout/route.ts
│       ├── admin/create-coach/route.ts
│       ├── coaches/[id]/notes/route.ts
│       ├── groups/route.ts
│       ├── groups/[id]/members/route.ts
│       ├── invite/route.ts               # genereert unieke tokens, checkt credits
│       ├── pricing-plans/[id]/route.ts   # PUT: admin past plan aan
│       ├── profiles/[id]/groups/route.ts
│       └── stripe/
│           ├── checkout/route.ts
│           └── webhook/route.ts
├── components/
│   └── layout/
│       ├── Sidebar.tsx                   # navigatie (rol-afhankelijk)
│       ├── Footer.tsx                    # ViveActive © 2026
│       └── AdminPreviewBar.tsx           # blauwe balk op preview-paginas
├── lib/
│   ├── questions.ts                      # 60 vragen + calculateScores()
│   └── supabase/
│       ├── client.ts                     # browser client
│       ├── server.ts                     # server component client
│       └── admin.ts                      # service role client (webhook)
├── middleware.ts                         # sessie refresh op /dashboard/*
└── types/index.ts                        # Role, Profile, SurveySession, Answer
```

---

## 7. Kernconcept: rollen

| Rol | Kan |
|---|---|
| `admin` | Alles zien en beheren. Geen creditlimiet. |
| `coach` | Respondenten uitnodigen (binnen creditlimiet), rapportages zien van eigen respondenten, groepen beheren. |
| `respondent` | Vragenlijst invullen, eigen resultaat zien. |

Rollen staan in `profiles.role`. Na Stripe-betaling zet de webhook de rol naar `coach`.

---

## 8. Kernlogica vragenlijst

- 60 vragen, Likert-schaal: `2=helemaal eens`, `1=eens`, `0=neutraal`, `-1=niet eens`, `-2=helemaal niet eens`, `-99=geen mening`
- Elke vraag heeft `axis: 'x' | 'y'` en `direction: 'positive' | 'negative'`
- Negatieve richting: waarde omdraaien (`value = -raw`)
- X-as = gedrag (actief/inactief), Y-as = motivatie
- Gemiddelde per as → kwadrant:
  - `x≥0, y≥0` → `active_motivated`
  - `x≥0, y<0` → `active_unmotivated`
  - `x<0, y≥0` → `inactive_motivated`
  - `x<0, y<0` → `inactive_unmotivated`
- Scores worden opgeslagen in `survey_sessions.x_score`, `.y_score`, `.quadrant`

---

## 9. Uitnodigingssysteem

- Coach genereert unieke 32-karakter token via `POST /api/invite`
- Token opgeslagen in `invite_tokens` met `coach_id` en `email`
- Respondent opent link `/register?token=...`, e-mail wordt pre-ingevuld en vergrendeld
- Na registratie: token gemarkeerd als `used`, respondent gekoppeld aan coach via `profiles.coach_id`
- Creditcheck in invite API: als `credits_used >= credits_total` → 403
- Credits ophogen bij elke nieuwe invite

---

## 10. Creditbeheer

- Admin stelt `max_respondents` in per plan via `/dashboard/pricing`
- Webhook leest dit bij aankoop op en slaat op in `coach_subscriptions.credits_total`
- Abonnementen (`subscription_*`) hebben `credits_total = null` = onbeperkt
- Coach ziet voortgangsbalk op `/dashboard/account`

---

## 11. Stripe-flow

1. Coach klikt plan op `/pricing` → `POST /api/stripe/checkout`
2. Stripe Checkout Session aangemaakt met `metadata.user_id` en `metadata.plan`
3. Redirect naar Stripe → betaling
4. Na betaling: webhook `checkout.session.completed` → webhook maakt `coach_subscriptions` record aan + zet rol naar `coach`
5. Coach wordt doorgestuurd naar `/dashboard/register-coach?session_id=...`

---

## 12. Huisstijl

| Element | Waarde |
|---|---|
| Oranje | `#F47920` |
| Blauw | `#1E3A8A` |
| Logo tekst | `<span orange>Fit</span><span blauw>kompas</span>` |
| Footer | `ViveActive © 2026` in grijstinten |
| Inputs | altijd `text-gray-900` anders zwart-op-zwart |
| Kaarten | `rounded-2xl shadow-sm bg-white` |
| Buttons primair | `bg-[#1E3A8A] text-white rounded-xl` |
| Buttons accent | `bg-[#F47920] text-white rounded-xl` |

---

## 13. Technische valkuilen

- **Gebruik altijd `.limit(1)` i.p.v. `.single()`** — `.single()` gooit een lege `{}` error als er geen rij is, wat moeilijk te debuggen is.
- **RLS staat uit** op alle tabellen. Altijd "Run without RLS" in Supabase SQL Editor.
- **Stripe webhook** heeft de `SUPABASE_SERVICE_ROLE_KEY` nodig (admin client), niet de anon key.
- **Stripe Price IDs** staan in `.env.local` én in de `pricing_plans` tabel (voor weergave). Bij tariefwijziging: beide aanpassen.
- **Server vs client components**: paginas die DB-data ophalen én interactie hebben, splitsen in een server wrapper + client `*Content.tsx` component.
- **AdminPreviewBar** toevoegen aan alle publieke preview-paginas (`/pricing`, `/survey`, `/register`) zodat admins terug kunnen naar het dashboard.

---

## 14. Nog te bouwen

- `/dashboard/sessions` — admin ziet alle sessies
- Engelstalige versie van de app
- Deploy naar Vercel (NEXT_PUBLIC_APP_URL updaten + Stripe webhook URL updaten)
