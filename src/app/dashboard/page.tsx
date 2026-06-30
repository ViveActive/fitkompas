import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { headers } from 'next/headers'

const QUADRANT_LABELS: Record<string, string> = {
  active_motivated: 'Actief & Gemotiveerd',
  active_unmotivated: 'Actief & Niet gemotiveerd',
  inactive_motivated: 'Niet actief & Gemotiveerd',
  inactive_unmotivated: 'Niet actief & Niet gemotiveerd',
}

const QUADRANT_COLORS: Record<string, string> = {
  active_motivated: 'bg-green-100 text-green-700',
  active_unmotivated: 'bg-blue-100 text-blue-700',
  inactive_motivated: 'bg-orange-100 text-orange-700',
  inactive_unmotivated: 'bg-red-100 text-red-700',
}

async function detectLang(): Promise<'nl' | 'en'> {
  try {
    const hdrs = await headers()
    const accept = hdrs.get('accept-language') ?? ''
    const preferred = accept.split(',')[0]?.split('-')[0]?.toLowerCase()
    return preferred === 'en' ? 'en' : 'nl'
  } catch {
    return 'nl'
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const lang = await detectLang()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const role = profile?.role ?? 'coachee'

  if (role === 'admin') {
    const [{ count: coachCount }, { count: coacheeCount }, { count: sessionCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coachee'),
      supabase.from('survey_sessions').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null),
    ])

    const { data: recentSessions } = await supabase
      .from('survey_sessions')
      .select('id, completed_at, quadrant, profiles!coachee_id(full_name, email)')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5)

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Overzicht</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Coaches', value: coachCount ?? 0, color: 'border-[#1E3A8A]' },
            { label: 'Respondenten', value: coacheeCount ?? 0, color: 'border-[#F47920]' },
            { label: 'Ingevulde vragenlijsten', value: sessionCount ?? 0, color: 'border-green-500' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl p-5 border-l-4 ${stat.color} shadow-sm`}>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Recente sessies</h2>
          {recentSessions?.length === 0 && <p className="text-sm text-gray-400">Nog geen sessies.</p>}
          <div className="space-y-3">
            {recentSessions?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {s.profiles?.full_name ?? s.profiles?.email ?? 'Onbekend'}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(s.completed_at).toLocaleDateString('nl-NL')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${QUADRANT_COLORS[s.quadrant] ?? 'bg-gray-100 text-gray-600'}`}>
                  {QUADRANT_LABELS[s.quadrant] ?? s.quadrant}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (role === 'coach') {
    const { data: respondenten } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('coach_id', user.id)

    const { count: sessionCount } = await supabase
      .from('survey_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', user.id)
      .not('completed_at', 'is', null)

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mijn dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border-l-4 border-[#1E3A8A] shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{respondenten?.length ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Respondenten</p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-[#F47920] shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{sessionCount ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Ingevulde vragenlijsten</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Mijn respondenten</h2>
            <Link href="/dashboard/invite" className="text-sm text-[#1E3A8A] hover:underline">+ Uitnodigen</Link>
          </div>
          {respondenten?.length === 0 && <p className="text-sm text-gray-400">Nog geen respondenten. Stuur een uitnodigingslink.</p>}
          <div className="space-y-2">
            {respondenten?.map((c: any) => (
              <Link key={c.id} href={`/dashboard/respondenten/${c.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                <p className="text-sm font-medium text-gray-800">{c.full_name ?? c.email}</p>
                <span className="text-xs text-[#1E3A8A]">Bekijk →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Coachee
  const { data: sessions } = await supabase
    .from('survey_sessions')
    .select('id, completed_at, quadrant, x_score, y_score')
    .eq('coachee_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Mijn resultaten</h1>
      <p className="text-gray-500 mb-6">Welkom, {profile?.full_name ?? user.email}</p>

      <Link href={`/${lang}/survey`}
        className="inline-block mb-8 bg-[#F47920] hover:bg-orange-600 text-white font-medium rounded-lg px-6 py-3 text-sm transition">
        {lang === 'en' ? 'Fill in a new questionnaire' : 'Nieuwe vragenlijst invullen'}
      </Link>

      {sessions?.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">Je hebt nog geen vragenlijst ingevuld.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions?.map((s: any) => (
          <Link key={s.id} href={`/${lang}/results/${s.id}`}
            className="flex items-center justify-between bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div>
              <p className="text-sm text-gray-400">{new Date(s.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <span className={`mt-1 inline-block text-xs px-2 py-1 rounded-full font-medium ${QUADRANT_COLORS[s.quadrant] ?? 'bg-gray-100 text-gray-600'}`}>
                {QUADRANT_LABELS[s.quadrant] ?? s.quadrant}
              </span>
            </div>
            <span className="text-xs text-gray-400">Bekijk rapport →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
