import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const QUADRANT_LABELS: Record<string, string> = {
  active_motivated: 'Actief & Gemotiveerd',
  active_unmotivated: 'Actief & Niet gemotiveerd',
  inactive_motivated: 'Niet actief & Gemotiveerd',
  inactive_unmotivated: 'Niet actief & Niet gemotiveerd',
}

const QUADRANT_COLORS: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  active_motivated:    { bg: '#dcfce7', text: '#15803d', dot: '#16a34a', bar: 'bg-green-500' },
  active_unmotivated:  { bg: '#dbeafe', text: '#1d4ed8', dot: '#2563eb', bar: 'bg-blue-500' },
  inactive_motivated:  { bg: '#ffedd5', text: '#c2410c', dot: '#F47920', bar: 'bg-orange-500' },
  inactive_unmotivated:{ bg: '#fee2e2', text: '#dc2626', dot: '#dc2626', bar: 'bg-red-500' },
}

function ScatterPlot({ sessions }: { sessions: any[] }) {
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-sm mx-auto">
      <rect x="10" y="10" width="95" height="95" fill="#dcfce7" rx="4" />
      <rect x="115" y="10" width="95" height="95" fill="#dbeafe" rx="4" />
      <rect x="10" y="115" width="95" height="95" fill="#ffedd5" rx="4" />
      <rect x="115" y="115" width="95" height="95" fill="#fee2e2" rx="4" />
      <text x="57" y="28" textAnchor="middle" fontSize="6.5" fill="#15803d" fontWeight="600">Actief &amp;</text>
      <text x="57" y="37" textAnchor="middle" fontSize="6.5" fill="#15803d" fontWeight="600">Gemotiveerd</text>
      <text x="162" y="28" textAnchor="middle" fontSize="6.5" fill="#1d4ed8" fontWeight="600">Actief &amp;</text>
      <text x="162" y="37" textAnchor="middle" fontSize="6.5" fill="#1d4ed8" fontWeight="600">Niet gemotiveerd</text>
      <text x="57" y="170" textAnchor="middle" fontSize="6.5" fill="#c2410c" fontWeight="600">Niet actief &amp;</text>
      <text x="57" y="179" textAnchor="middle" fontSize="6.5" fill="#c2410c" fontWeight="600">Gemotiveerd</text>
      <text x="162" y="170" textAnchor="middle" fontSize="6.5" fill="#dc2626" fontWeight="600">Niet actief &amp;</text>
      <text x="162" y="179" textAnchor="middle" fontSize="6.5" fill="#dc2626" fontWeight="600">Niet gemotiveerd</text>
      <line x1="112" y1="8" x2="112" y2="212" stroke="#94a3b8" strokeWidth="1" />
      <line x1="8" y1="112" x2="212" y2="112" stroke="#94a3b8" strokeWidth="1" />
      {sessions.map((s: any, i: number) => {
        const cx = ((s.x_score + 2) / 4) * 190 + 15
        const cy = ((-s.y_score + 2) / 4) * 190 + 15
        const color = QUADRANT_COLORS[s.quadrant]?.dot ?? '#6b7280'
        return <circle key={i} cx={cx} cy={cy} r="5" fill={color} opacity="0.75" />
      })}
    </svg>
  )
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group: selectedGroupId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = myProfile?.[0]?.role
  if (role !== 'admin' && role !== 'coach') redirect('/dashboard')

  // Beschikbare groepen voor filter
  const groupQuery = supabase.from('groups').select('id, name').order('name')
  if (role === 'coach') groupQuery.eq('created_by', user.id)
  const { data: groups } = await groupQuery

  // Respondenten ophalen — gefilterd op groep of alle
  let respondentIds: string[] = []

  if (selectedGroupId) {
    const { data: members } = await supabase
      .from('profile_groups')
      .select('profile_id, profiles(id, role)')
      .eq('group_id', selectedGroupId)

    // Directe respondenten in de groep
    const directRespondents = members
      ?.filter((m: any) => m.profiles?.role === 'respondent')
      .map((m: any) => m.profile_id) ?? []

    // Coaches in de groep → hun respondenten ook meenemen
    const coachIds = members
      ?.filter((m: any) => m.profiles?.role === 'coach')
      .map((m: any) => m.profile_id) ?? []

    let coachRespondents: string[] = []
    if (coachIds.length > 0) {
      const { data: cr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'respondent')
        .in('coach_id', coachIds)
      coachRespondents = cr?.map((r: any) => r.id) ?? []
    }

    respondentIds = [...new Set([...directRespondents, ...coachRespondents])]
  } else {
    const profileQuery = supabase.from('profiles').select('id').eq('role', 'respondent')
    if (role === 'coach') profileQuery.eq('coach_id', user.id)
    const { data } = await profileQuery
    respondentIds = data?.map((r: any) => r.id) ?? []
  }

  // Profieldata ophalen
  const { data: respondents } = respondentIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', respondentIds)
    : { data: [] }

  // Sessies ophalen
  let sessions: any[] = []
  if (respondentIds.length > 0) {
    const { data } = await supabase
      .from('survey_sessions')
      .select('id, coachee_id, completed_at, quadrant, x_score, y_score')
      .in('coachee_id', respondentIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
    sessions = data ?? []
  }

  const latestPerRespondent = Object.values(
    sessions.reduce((acc: Record<string, any>, s) => {
      if (!acc[s.coachee_id]) acc[s.coachee_id] = s
      return acc
    }, {})
  )

  const distribution: Record<string, number> = {
    active_motivated: 0, active_unmotivated: 0, inactive_motivated: 0, inactive_unmotivated: 0,
  }
  latestPerRespondent.forEach((s: any) => { if (s.quadrant in distribution) distribution[s.quadrant]++ })

  const total = latestPerRespondent.length
  const avgX = total > 0 ? latestPerRespondent.reduce((s: number, r: any) => s + r.x_score, 0) / total : null
  const avgY = total > 0 ? latestPerRespondent.reduce((s: number, r: any) => s + r.y_score, 0) / total : null
  const respondentMap = Object.fromEntries((respondents ?? []).map((r: any) => [r.id, r]))
  const selectedGroup = groups?.find(g => g.id === selectedGroupId)

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Groepsrapportage</h1>
          <p className="text-sm text-gray-400 mt-1">
            {selectedGroup ? `Groep: ${selectedGroup.name} · ` : ''}{total} respondent{total !== 1 ? 'en' : ''} met meting
          </p>
        </div>

        {/* Groepsfilter */}
        {groups && groups.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              href="/dashboard/reports"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!selectedGroupId ? 'bg-[#1E3A8A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Alle
            </Link>
            {groups.map((g: any) => (
              <Link
                key={g.id}
                href={`/dashboard/reports?group=${g.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedGroupId === g.id ? 'bg-[#1E3A8A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {total === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          {selectedGroupId ? 'Geen respondenten in deze groep met een afgeronde meting.' : 'Nog geen respondenten met een afgeronde vragenlijst.'}
        </div>
      )}

      {total > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(Object.keys(distribution) as string[]).map(q => {
              const count = distribution[q]
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const c = QUADRANT_COLORS[q]
              return (
                <div key={q} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="text-2xl font-bold" style={{ color: c.dot }}>{count}</div>
                  <div className="text-xs font-medium mt-1" style={{ color: c.text }}>{QUADRANT_LABELS[q]}</div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{pct}%</div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-4">Groepsoverzicht</h2>
              <ScatterPlot sessions={latestPerRespondent} />
              <p className="text-xs text-gray-400 text-center mt-2">Elk punt = 1 respondent (laatste meting)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
              <h2 className="font-semibold text-gray-700">Gemiddelde scores</h2>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Activiteit (x)</span>
                  <span className="font-semibold text-gray-800">{avgX?.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: `${((avgX! + 2) / 4) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>-2 (passief)</span><span>+2 (actief)</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Motivatie (y)</span>
                  <span className="font-semibold text-gray-800">{avgY?.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F47920] rounded-full" style={{ width: `${((avgY! + 2) / 4) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>-2 (niet gem.)</span><span>+2 (gemotiveerd)</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Verdeling kwadranten</h3>
                {(Object.keys(distribution) as string[]).map(q => {
                  const count = distribution[q]
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const c = QUADRANT_COLORS[q]
                  return (
                    <div key={q} className="flex items-center gap-3 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                      <span className="text-xs text-gray-500 flex-1">{QUADRANT_LABELS[q]}</span>
                      <span className="text-xs font-semibold text-gray-700">{count}</span>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Individuele respondenten</h2>
            <div className="space-y-2">
              {latestPerRespondent.map((s: any) => {
                const r = respondentMap[s.coachee_id]
                const c = QUADRANT_COLORS[s.quadrant]
                return (
                  <Link key={s.coachee_id} href={`/dashboard/coachees/${s.coachee_id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: c?.dot ?? '#6b7280' }}>
                        {(r?.full_name ?? r?.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r?.full_name ?? r?.email}</p>
                        <p className="text-xs text-gray-400">{r?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: c?.bg, color: c?.text }}>
                        {QUADRANT_LABELS[s.quadrant]}
                      </span>
                      <span>x: {s.x_score?.toFixed(1)} · y: {s.y_score?.toFixed(1)}</span>
                      <span className="text-[#1E3A8A]">Bekijk →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
