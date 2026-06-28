import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

const QUADRANT_DOT: Record<string, string> = {
  active_motivated: 'bg-green-500',
  active_unmotivated: 'bg-blue-500',
  inactive_motivated: 'bg-orange-500',
  inactive_unmotivated: 'bg-red-500',
}

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ kwadrant?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = profile?.[0]?.role
  if (role !== 'admin' && role !== 'coach') redirect('/dashboard')

  const { kwadrant } = await searchParams

  let query = supabase
    .from('survey_sessions')
    .select('id, completed_at, quadrant, x_score, y_score, coachee_id, coach_id')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (role === 'coach') query = query.eq('coach_id', user.id)
  if (kwadrant) query = query.eq('quadrant', kwadrant)

  const { data: sessions } = await query

  // Haal profielen op voor respondenten en coaches
  const coacheeIds = [...new Set(sessions?.map((s: any) => s.coachee_id).filter(Boolean))]
  const coachIds = [...new Set(sessions?.map((s: any) => s.coach_id).filter(Boolean))]
  const allIds = [...new Set([...coacheeIds, ...coachIds])]

  const { data: profiles } = allIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', allIds)
    : { data: [] }

  const profileMap: Record<string, { full_name: string | null; email: string }> = {}
  profiles?.forEach((p: any) => { profileMap[p.id] = p })

  const counts: Record<string, number> = {}
  sessions?.forEach((s: any) => {
    if (s.quadrant) counts[s.quadrant] = (counts[s.quadrant] ?? 0) + 1
  })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alle sessies</h1>
          <p className="text-sm text-gray-400 mt-0.5">{sessions?.length ?? 0} ingevulde vragenlijsten</p>
        </div>
      </div>

      {/* Kwadrant tellingen */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(QUADRANT_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={kwadrant === key ? '/dashboard/sessions' : `/dashboard/sessions?kwadrant=${key}`}
            className={`rounded-2xl p-4 text-center transition border-2 ${
              kwadrant === key
                ? 'border-[#1E3A8A] bg-white shadow-md'
                : 'border-transparent bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`inline-block w-2.5 h-2.5 rounded-full mb-2 ${QUADRANT_DOT[key]}`} />
            <p className="text-2xl font-bold text-gray-800">{counts[key] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* Sessie lijst */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {kwadrant && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm text-[#1E3A8A] font-medium">
              Filter: {QUADRANT_LABELS[kwadrant]}
            </span>
            <Link href="/dashboard/sessions" className="text-xs text-gray-400 hover:text-gray-600">
              Wis filter ×
            </Link>
          </div>
        )}

        {sessions?.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            Geen sessies gevonden.
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {sessions?.map((s: any) => {
            const respondent = profileMap[s.coachee_id]
            const coach = profileMap[s.coach_id]
            return (
              <Link
                key={s.id}
                href={`/results/${s.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${QUADRANT_DOT[s.quadrant] ?? 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {respondent?.full_name ?? respondent?.email ?? 'Onbekend'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {new Date(s.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="hidden sm:block text-right flex-shrink-0">
                  {s.quadrant && (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${QUADRANT_COLORS[s.quadrant]}`}>
                      {QUADRANT_LABELS[s.quadrant]}
                    </span>
                  )}
                </div>
                <span className="text-[#1E3A8A] text-sm flex-shrink-0">→</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
