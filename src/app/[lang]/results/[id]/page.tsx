import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidLang, type Lang } from '@/lib/i18n'
import Link from 'next/link'
import LangSwitcher from '@/components/layout/LangSwitcher'
import AdminPreviewBar from '@/components/layout/AdminPreviewBar'
import { QUESTIONS } from '@/lib/questions'

const DIMENSIONS = {
  nl: [
    { id: 1, label: 'Actief leven', description: 'Hoe actief je bent in sport en bewegen' },
    { id: 2, label: 'In beweging komen (daadkracht)', description: 'De mate waarin je initiatief neemt en dingen aanpakt' },
    { id: 3, label: 'Positieve instelling', description: 'Hoe positief je kijkt naar bewegen en gezondheid' },
    { id: 4, label: 'Sociale steun', description: 'Steun en invloed van je omgeving' },
    { id: 5, label: 'Gezond leven', description: 'Aandacht voor gezondheid en voeding' },
  ],
  en: [
    { id: 1, label: 'Active life', description: 'How active you are in sport and movement' },
    { id: 2, label: 'Drive', description: 'The extent to which you take initiative and get things done' },
    { id: 3, label: 'Positive mindset', description: 'How positively you view movement and health' },
    { id: 4, label: 'Social support', description: 'Support and influence of your surroundings' },
    { id: 5, label: 'Healthy life', description: 'Attention to health and nutrition' },
  ],
}

function calcDimensionScores(answers: { question_id: number; value: number }[]) {
  const scoreMap: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  for (const answer of answers) {
    if (answer.value === -99) continue
    const question = QUESTIONS.find(q => q.id === answer.question_id)
    if (!question) continue
    const value = question.direction === 'positive' ? answer.value : -answer.value
    scoreMap[question.dimension].push(value)
  }
  return scoreMap
}

const QUADRANT_INFO = {
  nl: {
    active_motivated: {
      title: 'Actief & Gemotiveerd', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
      description: 'Bewegen en gezondheid wordt door jou als iets positiefs opgepakt. Met een bepaald doel voor ogen en voorzien van een dosis daadkracht besteed je voldoende aandacht aan bewegen en gezondheid.',
    },
    active_unmotivated: {
      title: 'Actief & Niet gemotiveerd', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
      description: 'Actief werken aan bewegen en gezondheid lukt wel, maar echt leuk vind je het niet. De kans op een terugval is groot als de hoofdreden van bewegen niet meer actueel is.',
    },
    inactive_motivated: {
      title: 'Niet actief & Gemotiveerd', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
      description: 'Actief werken aan bewegen en gezondheid wil je wel, maar het lukt niet de stap te maken naar het DOEN. Diverse oorzaken kunnen de stap naar actie ondermijnen.',
    },
    inactive_unmotivated: {
      title: 'Niet actief & Niet gemotiveerd', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
      description: 'Als je geen ervaring hebt met sport en bewegen, niet openstaat voor verandering en sociale ondersteuning mist, wordt het moeilijk om actief en gemotiveerd te worden. Maar het KAN wel — stapje voor stapje.',
    },
  },
  en: {
    active_motivated: {
      title: 'Active & Motivated', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
      description: 'You approach movement and health positively. With a clear goal in mind and a dose of drive, you give sufficient attention to movement and health.',
    },
    active_unmotivated: {
      title: 'Active & Not motivated', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
      description: 'You manage to work actively on movement and health, but you don\'t really enjoy it. The risk of relapse is high if the main reason for exercising is no longer relevant.',
    },
    inactive_motivated: {
      title: 'Not active & Motivated', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
      description: 'You want to work actively on movement and health, but you can\'t quite make the step towards DOING. Various causes may undermine the step to action.',
    },
    inactive_unmotivated: {
      title: 'Not active & Not motivated', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
      description: 'Without experience in sport and movement, without openness to change and missing social support, it becomes difficult to become active and motivated. But it IS possible — step by step.',
    },
  },
}

const labels = {
  nl: {
    result: 'Jouw resultaat',
    compass: 'Jouw positie op het kompas',
    each_dot: 'Elke stip = jouw score',
    activity: 'Activiteit (x)',
    motivation: 'Motivatie (y)',
    back: 'Terug naar dashboard',
    motivated: 'Gemotiveerd',
    unmotivated: 'Niet gemotiveerd',
    active: 'Actief',
    passive: 'Passief',
  },
  en: {
    result: 'Your result',
    compass: 'Your position on the compass',
    each_dot: 'Each dot = your score',
    activity: 'Activity (x)',
    motivation: 'Motivation (y)',
    back: 'Back to dashboard',
    motivated: 'Motivated',
    unmotivated: 'Not motivated',
    active: 'Active',
    passive: 'Passive',
  },
}

export default async function LangResultsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang: rawLang, id } = await params
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: sessions } = await supabase.from('survey_sessions').select('*').eq('id', id).limit(1)
  const session = sessions?.[0]
  if (!session) redirect('/dashboard')

  const { data: answers } = await supabase.from('answers').select('question_id, value').eq('session_id', id)
  const dimensionScores = calcDimensionScores(answers ?? [])

  const quadrant = session.quadrant as keyof typeof QUADRANT_INFO.nl
  const info = QUADRANT_INFO[lang][quadrant]
  const l = labels[lang]
  const dims = DIMENSIONS[lang]

  const xPct = Math.round(((session.x_score + 2) / 4) * 100)
  const yPct = Math.round(((session.y_score + 2) / 4) * 100)

  return (
    <>
    <AdminPreviewBar />
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </h1>
            <p className="text-gray-500 text-sm">{l.result}</p>
          </div>
          <LangSwitcher lang={lang} />
        </div>

        <div className={`rounded-2xl border p-6 mb-6 ${info.bg} ${info.border}`}>
          <h2 className={`text-xl font-bold mb-2 ${info.color}`}>{info.title}</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{info.description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{l.compass}</h3>
          <div className="relative w-full aspect-square max-w-xs mx-auto border-2 border-gray-200 rounded-lg">
            <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-gray-300" /></div>
            <div className="absolute inset-0 flex justify-center"><div className="h-full w-px bg-gray-300" /></div>
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-green-600 font-medium">{l.motivated}</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-500 font-medium">{l.unmotivated}</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-red-500 font-medium" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}>{l.passive}</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium" style={{ writingMode: 'vertical-rl' }}>{l.active}</span>

            {/* Max Verstappen — actief & gemotiveerd (ver rechtsboven) */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: '88%', top: '10%' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#E8670A" stroke="white" strokeWidth="1.5"/>
                {/* helm */}
                <ellipse cx="16" cy="14" rx="9" ry="8" fill="#CC5500"/>
                <rect x="8" y="14" width="16" height="6" rx="2" fill="#CC5500"/>
                {/* vizier */}
                <rect x="9" y="15" width="14" height="4" rx="1.5" fill="#1a1a2e"/>
                {/* #1 */}
                <text x="16" y="20" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">1</text>
                {/* kin */}
                <ellipse cx="16" cy="21" rx="5" ry="2" fill="#CC5500"/>
              </svg>
              <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">Max V.</span>
            </div>

            {/* Maarten van Rossem — actief & niet gemotiveerd (rechtsonder) */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: '68%', top: '82%' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#f0e6d3" stroke="white" strokeWidth="1.5"/>
                {/* hoofd */}
                <ellipse cx="16" cy="14" rx="7" ry="8" fill="#f5d5b0"/>
                {/* haar grijs */}
                <ellipse cx="16" cy="8" rx="7" ry="4" fill="#aaaaaa"/>
                {/* baard */}
                <ellipse cx="16" cy="21" rx="7" ry="4" fill="#cccccc"/>
                {/* bril */}
                <circle cx="12" cy="14" r="3" fill="none" stroke="#555" strokeWidth="1.2"/>
                <circle cx="20" cy="14" r="3" fill="none" stroke="#555" strokeWidth="1.2"/>
                <line x1="15" y1="14" x2="17" y2="14" stroke="#555" strokeWidth="1.2"/>
                {/* mond nors */}
                <path d="M13 19 Q16 17 19 19" stroke="#888" strokeWidth="1" fill="none"/>
              </svg>
              <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">M. v. Rossem</span>
            </div>

            {/* Froukje de Both — niet actief & gemotiveerd (linksboven) */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: '32%', top: '18%' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#fce4ec" stroke="white" strokeWidth="1.5"/>
                {/* hoofd */}
                <ellipse cx="16" cy="15" rx="7" ry="8" fill="#f9c8a0"/>
                {/* haar donker lang */}
                <ellipse cx="16" cy="8" rx="8" ry="5" fill="#3d2b1f"/>
                <rect x="8" y="8" width="3" height="12" rx="1.5" fill="#3d2b1f"/>
                <rect x="21" y="8" width="3" height="12" rx="1.5" fill="#3d2b1f"/>
                {/* ogen */}
                <circle cx="13" cy="14" r="1.2" fill="#3d2b1f"/>
                <circle cx="19" cy="14" r="1.2" fill="#3d2b1f"/>
                {/* glimlach */}
                <path d="M13 18 Q16 21 19 18" stroke="#c0776a" strokeWidth="1.2" fill="none"/>
              </svg>
              <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">Froukje d.B.</span>
            </div>

            {/* Midas Dekkers — niet actief & niet gemotiveerd (linksonder) */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: '20%', top: '72%' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#e8f5e9" stroke="white" strokeWidth="1.5"/>
                {/* hoofd */}
                <ellipse cx="16" cy="15" rx="7" ry="8" fill="#f5d5b0"/>
                {/* haar grijs dun */}
                <ellipse cx="16" cy="8" rx="6" ry="3" fill="#bbbbbb"/>
                {/* baard licht */}
                <ellipse cx="16" cy="22" rx="5" ry="3" fill="#dddddd"/>
                {/* ogen */}
                <circle cx="13" cy="14" r="1.2" fill="#555"/>
                <circle cx="19" cy="14" r="1.2" fill="#555"/>
                {/* neutrale mond */}
                <line x1="13" y1="19" x2="19" y2="19" stroke="#999" strokeWidth="1"/>
                {/* slak decoratief */}
                <text x="24" y="28" fontSize="7">🐌</text>
              </svg>
              <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">Midas D.</span>
            </div>

            <div className="absolute w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPct}%`, top: `${100 - yPct}%` }} />
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">{l.each_dot}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-400">{l.activity}</span>
              <p className="font-semibold text-gray-800">{session.x_score?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-400">{l.motivation}</span>
              <p className="font-semibold text-gray-800">{session.y_score?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Dimensie rapportage */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-5">
            {lang === 'nl' ? '5 dimensies' : '5 dimensions'}
          </h3>
          <div className="space-y-4">
            {dims.map(dim => {
              const values = dimensionScores[dim.id] ?? []
              const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
              // avg loopt van -2 tot +2, omzetten naar 0-100%
              const pct = avg !== null ? Math.round(((avg + 2) / 4) * 100) : null
              const color =
                pct === null ? 'bg-gray-200'
                : pct >= 60 ? 'bg-green-500'
                : pct >= 40 ? 'bg-yellow-400'
                : 'bg-red-400'

              return (
                <div key={dim.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-gray-700">{dim.label}</span>
                    <span className="text-xs text-gray-400">{pct !== null ? `${pct}%` : '–'}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${color}`}
                      style={{ width: pct !== null ? `${pct}%` : '0%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{dim.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <Link href="/dashboard"
          className="block text-center bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition">
          {l.back}
        </Link>
      </div>
    </div>
    </>
  )
}
