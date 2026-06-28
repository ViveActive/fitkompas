import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CoachNotes from './CoachNotes'
import ProfileGroupManager from './ProfileGroupManager'

const PLAN_LABELS: Record<string, string> = {
  bundle_10: 'Starter — 10 credits',
  bundle_30: 'Pro Bundle — 30 credits',
  subscription_monthly: 'Maandabonnement',
  subscription_yearly: 'Jaarabonnement',
}

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (myProfile?.[0]?.role !== 'admin') redirect('/dashboard')

  const { data: coachArr } = await supabase
    .from('profiles')
    .select('id, full_name, email, coach_code, created_at, notes')
    .eq('id', id)
    .limit(1)
  const coach = coachArr?.[0]
  if (!coach) redirect('/dashboard/coaches')

  const { data: subscriptions } = await supabase
    .from('coach_subscriptions')
    .select('id, plan_id, stripe_customer_id, stripe_subscription_id, created_at')
    .eq('coach_id', id)
    .order('created_at', { ascending: false })

  const { data: respondents } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('coach_id', id)
    .eq('role', 'respondent')
    .order('created_at', { ascending: false })

  const { data: invites } = await supabase
    .from('invite_tokens')
    .select('email, used, created_at, used_at')
    .eq('coach_id', id)
    .order('created_at', { ascending: false })

  // Groepen
  const { data: allGroups } = await supabase.from('groups').select('id, name').order('name')
  const { data: memberOf } = await supabase.from('profile_groups').select('group_id').eq('profile_id', id)
  const memberGroupIds = memberOf?.map((r: any) => r.group_id) ?? []

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/coaches" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Terug naar coaches
      </Link>

      {/* Profielkaart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-xl font-bold text-[#1E3A8A]">
          {(coach.full_name ?? coach.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{coach.full_name ?? coach.email}</h1>
          <p className="text-sm text-gray-400">{coach.email}</p>
          <p className="text-xs text-gray-300 mt-0.5">
            Geregistreerd op {new Date(coach.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {coach.coach_code && (
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Coach code</p>
            <span className="text-lg font-bold font-mono text-[#F47920] tracking-widest">{coach.coach_code}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Aankopen */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Aankopen ({subscriptions?.length ?? 0})</h2>
          {subscriptions?.length === 0 && (
            <p className="text-sm text-gray-400">Nog geen aankopen.</p>
          )}
          <div className="space-y-3">
            {subscriptions?.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {PLAN_LABELS[s.plan_id] ?? s.plan_id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                    Actief
                  </span>
                </div>
                {s.stripe_customer_id && (
                  <p className="text-xs text-gray-300 font-mono mt-2 truncate">
                    Stripe: {s.stripe_customer_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Uitnodigingen */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Uitnodigingen ({invites?.length ?? 0})</h2>
          {invites?.length === 0 && (
            <p className="text-sm text-gray-400">Nog geen uitnodigingen verstuurd.</p>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {invites?.map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm text-gray-700">{inv.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inv.used ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {inv.used ? 'Gebruikt' : 'Openstaand'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groepen */}
      <div className="mb-6">
        <ProfileGroupManager profileId={id} allGroups={allGroups ?? []} memberGroupIds={memberGroupIds} />
      </div>

      {/* Opmerkingen */}
      <div className="mb-6">
        <CoachNotes coachId={id} initialNotes={coach.notes ?? null} />
      </div>

      {/* Respondenten */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Respondenten ({respondents?.length ?? 0})</h2>
        {respondents?.length === 0 && (
          <p className="text-sm text-gray-400">Nog geen respondenten gekoppeld.</p>
        )}
        <div className="space-y-2">
          {respondents?.map((r: any) => (
            <Link key={r.id} href={`/dashboard/coachees/${r.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
              <div>
                <p className="text-sm font-medium text-gray-800">{r.full_name ?? r.email}</p>
                <p className="text-xs text-gray-400">{r.email}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{new Date(r.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-[#1E3A8A]">Bekijk →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
