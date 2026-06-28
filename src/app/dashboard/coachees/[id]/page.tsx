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
  active_motivated: 'bg-green-100 text-green-700 border-green-200',
  active_unmotivated: 'bg-blue-100 text-blue-700 border-blue-200',
  inactive_motivated: 'bg-orange-100 text-orange-700 border-orange-200',
  inactive_unmotivated: 'bg-red-100 text-red-700 border-red-200',
}

const QUADRANT_DOT: Record<string, string> = {
  active_motivated: '#16a34a',
  active_unmotivated: '#2563eb',
  inactive_motivated: '#F47920',
  inactive_unmotivated: '#dc2626',
}

function QuadrantChart({ x, y, quadrant }: { x: number; y: number; quadrant: string }) {
  // x en y lopen van -2 tot +2 → omzetten naar SVG coords (0-200)
  const cx = ((x + 2) / 4) * 180 + 10
  const cy = ((-y + 2) / 4) * 180 + 10
  const color = QUADRANT_DOT[quadrant] ?? '#6b7280'

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-xs mx-auto">
      {/* Achtergrond kwadranten */}
      <rect x="10" y="10" width="90" height="90" fill="#dcfce7" rx="4" />
      <rect x="100" y="10" width="90" height="90" fill="#dbeafe" rx="4" />
      <rect x="10" y="100" width="90" height="90" fill="#ffedd5" rx="4" />
      <rect x="100" y="100" width="90" height="90" fill="#fee2e2" rx="4" />

      {/* Labels kwadranten */}
      <text x="55" y="30" textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="600">Actief &</text>
      <text x="55" y="39" textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="600">Gemotiveerd</text>
      <text x="145" y="30" textAnchor="middle" fontSize="7" fill="#1d4ed8" fontWeight="600">Actief &</text>
      <text x="145" y="39" textAnchor="middle" fontSize="7" fill="#1d4ed8" fontWeight="600">Niet gemotiveerd</text>
      <text x="55" y="155" textAnchor="middle" fontSize="7" fill="#c2410c" fontWeight="600">Niet actief &</text>
      <text x="55" y="164" textAnchor="middle" fontSize="7" fill="#c2410c" fontWeight="600">Gemotiveerd</text>
      <text x="145" y="155" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="600">Niet actief &</text>
      <text x="145" y="164" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="600">Niet gemotiveerd</text>

      {/* Assen */}
      <line x1="100" y1="8" x2="100" y2="192" stroke="#94a3b8" strokeWidth="1" />
      <line x1="8" y1="100" x2="192" y2="100" stroke="#94a3b8" strokeWidth="1" />

      {/* As-labels */}
      <text x="100" y="200" textAnchor="middle" fontSize="6" fill="#64748b">← Passief · Actief →</text>
      <text x="4" y="100" textAnchor="middle" fontSize="6" fill="#64748b" transform="rotate(-90, 4, 100)">← Niet gem. · Gemot. →</text>

      {/* Punt van respondent */}
      <circle cx={cx} cy={cy} r="7" fill={color} opacity="0.9" />
      <circle cx={cx} cy={cy} r="4" fill="white" />
      <circle cx={cx} cy={cy} r="2" fill={color} />
    </svg>
  )
}

export default async function CoacheePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = myProfile?.[0]?.role

  const { data: coacheeArr } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('id', id)
    .limit(1)
  const coachee = coacheeArr?.[0]
  if (!coachee) redirect('/dashboard/coachees')

  if (role === 'coach') {
    const { data: check } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .eq('coach_id', user.id)
      .limit(1)
    if (!check?.[0]) redirect('/dashboard')
  }

  const { data: sessions } = await supabase
    .from('survey_sessions')
    .select('id, completed_at, quadrant, x_score, y_score')
    .eq('coachee_id', id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  const latest = sessions?.[0]

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/coachees" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Terug naar overzicht
      </Link>

      {/* Profielkaart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-xl font-bold text-[#1E3A8A]">
          {(coachee.full_name ?? coachee.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{coachee.full_name ?? coachee.email}</h1>
          <p className="text-sm text-gray-400">{coachee.email}</p>
          <p className="text-xs text-gray-300 mt-0.5">
            Lid sinds {new Date(coachee.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">{sessions?.length ?? 0} meting{sessions?.length !== 1 ? 'en' : ''}</p>
        </div>
      </div>

      {!latest && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          Deze respondent heeft nog geen vragenlijst ingevuld.
        </div>
      )}

      {latest && (
        <>
          {/* Laatste meting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Kwadrant visualisatie */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-1">Positie in kwadrant</h2>
              <p className="text-xs text-gray-400 mb-4">
                Laatste meting: {new Date(latest.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <QuadrantChart x={latest.x_score} y={latest.y_score} quadrant={latest.quadrant} />
              <div className="mt-4 text-center">
                <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border ${QUADRANT_COLORS[latest.quadrant] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {QUADRANT_LABELS[latest.quadrant] ?? latest.quadrant}
                </span>
              </div>
            </div>

            {/* Scores */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-semibold text-gray-700">Scores laatste meting</h2>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Activiteit (x)</span>
                  <span className="font-semibold text-gray-800">{latest.x_score?.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E3A8A] rounded-full"
                    style={{ width: `${((latest.x_score + 2) / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>-2 (passief)</span><span>+2 (actief)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Motivatie (y)</span>
                  <span className="font-semibold text-gray-800">{latest.y_score?.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F47920] rounded-full"
                    style={{ width: `${((latest.y_score + 2) / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>-2 (niet gem.)</span><span>+2 (gemotiveerd)</span>
                </div>
              </div>

              {sessions && sessions.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Verloop over tijd</h3>
                  <div className="space-y-2">
                    {sessions.slice(0, 5).map((s: any, i: number) => (
                      <div key={s.id} className="flex items-center gap-3 text-xs">
                        <span className="text-gray-300 w-24 shrink-0">
                          {new Date(s.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${QUADRANT_COLORS[s.quadrant] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {QUADRANT_LABELS[s.quadrant] ?? s.quadrant}
                        </span>
                        {i === 0 && <span className="text-[#F47920] font-semibold">← laatste</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alle metingen */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Alle metingen ({sessions?.length})</h2>
            <div className="space-y-2">
              {sessions?.map((s: any) => (
                <Link key={s.id} href={`/results/${s.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {new Date(s.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${QUADRANT_COLORS[s.quadrant] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {QUADRANT_LABELS[s.quadrant] ?? s.quadrant}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    <span>Activiteit: <span className="font-semibold text-gray-700">{s.x_score?.toFixed(2)}</span></span>
                    <span>Motivatie: <span className="font-semibold text-gray-700">{s.y_score?.toFixed(2)}</span></span>
                    <span className="text-[#1E3A8A] text-xs">Bekijk →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
