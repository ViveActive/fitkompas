import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const PLAN_LABELS: Record<string, string> = {
  bundle_10: 'Starter — 10 credits',
  bundle_30: 'Pro Bundle — 30 credits',
  subscription_monthly: 'Maandabonnement',
  subscription_yearly: 'Jaarabonnement',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileArr } = await supabase
    .from('profiles')
    .select('id, full_name, email, coach_code, created_at, role')
    .eq('id', user.id)
    .limit(1)
  const profile = profileArr?.[0]
  if (!profile || profile.role === 'respondent') redirect('/dashboard')

  const { data: subscriptions } = await supabase
    .from('coach_subscriptions')
    .select('id, plan_name, stripe_customer_id, created_at, credits_total, credits_used, status')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const activeSub = subscriptions?.find((s: any) => s.status === 'active')

  const { data: invites } = await supabase
    .from('invite_tokens')
    .select('email, used, created_at, used_at')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const { data: respondents } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('coach_id', user.id)
    .eq('role', 'respondent')
    .order('created_at', { ascending: false })

  const usedInvites = invites?.filter((i: any) => i.used).length ?? 0
  const openInvites = invites?.filter((i: any) => !i.used).length ?? 0

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mijn account</h1>

      {/* Profielkaart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-xl font-bold text-[#1E3A8A]">
          {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">{profile.full_name ?? profile.email}</h2>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <p className="text-xs text-gray-300 mt-0.5">
            Coach sinds {new Date(profile.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {profile.coach_code && (
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Jouw coach code</p>
            <span className="text-2xl font-bold font-mono text-[#F47920] tracking-widest">{profile.coach_code}</span>
          </div>
        )}
      </div>

      {/* Credits balk */}
      {activeSub?.credits_total != null && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">Vragenlijsten resterend</h2>
            <span className="text-sm font-bold text-gray-800">
              {activeSub.credits_total - activeSub.credits_used} van {activeSub.credits_total}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (activeSub.credits_used / activeSub.credits_total) * 100)}%`,
                backgroundColor: activeSub.credits_used >= activeSub.credits_total ? '#ef4444' : '#F47920',
              }}
            />
          </div>
          {activeSub.credits_used >= activeSub.credits_total && (
            <p className="text-xs text-red-500 mt-2">
              Je hebt je limiet bereikt.{' '}
              <a href="/pricing" className="underline">Koop een nieuw pakket →</a>
            </p>
          )}
        </div>
      )}

      {/* Statistieken */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-[#1E3A8A]">{respondents?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Respondenten</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{usedInvites}</p>
          <p className="text-xs text-gray-400 mt-1">Uitnodigingen gebruikt</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-gray-400">{openInvites}</p>
          <p className="text-xs text-gray-400 mt-1">Uitnodigingen openstaand</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">

        {/* Abonnementen */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Mijn abonnementen</h2>
            <Link href="/pricing" className="text-xs text-[#1E3A8A] hover:underline">+ Nieuw plan</Link>
          </div>
          {subscriptions?.length === 0 && (
            <p className="text-sm text-gray-400">Nog geen aankopen.</p>
          )}
          <div className="space-y-3">
            {subscriptions?.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {PLAN_LABELS[s.plan_name] ?? s.plan_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                    Actief
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uitnodigingen */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Uitnodigingen</h2>
            <Link href="/dashboard/invite" className="text-xs text-[#F47920] hover:underline">+ Nieuwe uitnodiging</Link>
          </div>
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

      {/* Respondenten */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Mijn respondenten ({respondents?.length ?? 0})</h2>
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
