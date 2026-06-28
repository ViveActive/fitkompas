import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const QUADRANT_INFO = {
  active_motivated: {
    title: 'Actief & Gemotiveerd',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'Bewegen en gezondheid wordt door jou als iets positiefs opgepakt. Met een bepaald doel voor ogen en voorzien van een dosis daadkracht besteed je voldoende aandacht aan bewegen en gezondheid.',
  },
  active_unmotivated: {
    title: 'Actief & Niet gemotiveerd',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Actief werken aan bewegen en gezondheid lukt wel, maar echt leuk vind je het niet. De kans op een terugval is groot als de hoofdreden van bewegen niet meer actueel is.',
  },
  inactive_motivated: {
    title: 'Niet actief & Gemotiveerd',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Actief werken aan bewegen en gezondheid wil je wel, maar het lukt niet de stap te maken naar het DOEN. Diverse oorzaken kunnen de stap naar actie ondermijnen.',
  },
  inactive_unmotivated: {
    title: 'Niet actief & Niet gemotiveerd',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Als je geen ervaring hebt met sport en bewegen, niet openstaat voor verandering en sociale ondersteuning mist, wordt het moeilijk om actief en gemotiveerd te worden. Maar het KAN wel — stapje voor stapje.',
  },
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('survey_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) redirect('/dashboard')

  const quadrant = session.quadrant as keyof typeof QUADRANT_INFO
  const info = QUADRANT_INFO[quadrant]

  // Normalize scores to 0-100 for display (range is -2 to 2)
  const xPct = Math.round(((session.x_score + 2) / 4) * 100)
  const yPct = Math.round(((session.y_score + 2) / 4) * 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-green-600 mb-1">Fitkompas</h1>
        <p className="text-gray-500 mb-6">Jouw resultaat</p>

        {/* Quadrant label */}
        <div className={`rounded-2xl border p-6 mb-6 ${info.bg} ${info.border}`}>
          <h2 className={`text-xl font-bold mb-2 ${info.color}`}>{info.title}</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{info.description}</p>
        </div>

        {/* Kompas visualisatie */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Jouw positie op het kompas</h3>
          <div className="relative w-full aspect-square max-w-xs mx-auto border-2 border-gray-200 rounded-lg">
            {/* Assen */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gray-300" />
            </div>
            <div className="absolute inset-0 flex justify-center">
              <div className="h-full w-px bg-gray-300" />
            </div>

            {/* Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-green-600 font-medium">Gemotiveerd</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-500 font-medium">Niet gemotiveerd</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-red-500 font-medium" style={{writingMode:'vertical-rl', transform:'rotate(180deg) translateY(50%)'}}>Passief</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium" style={{writingMode:'vertical-rl'}}>Actief</span>

            {/* Punt */}
            <div
              className="absolute w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPct}%`, top: `${100 - yPct}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-400">Activiteit (x)</span>
              <p className="font-semibold text-gray-800">{session.x_score?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-400">Motivatie (y)</span>
              <p className="font-semibold text-gray-800">{session.y_score?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <a
          href="/dashboard"
          className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg py-2.5 text-sm transition"
        >
          Terug naar dashboard
        </a>
      </div>
    </div>
  )
}
