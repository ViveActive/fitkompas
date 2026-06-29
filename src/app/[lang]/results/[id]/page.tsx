import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidLang, type Lang } from '@/lib/i18n'
import Link from 'next/link'

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

  const quadrant = session.quadrant as keyof typeof QUADRANT_INFO.nl
  const info = QUADRANT_INFO[lang][quadrant]
  const l = labels[lang]

  const xPct = Math.round(((session.x_score + 2) / 4) * 100)
  const yPct = Math.round(((session.y_score + 2) / 4) * 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
        </h1>
        <p className="text-gray-500 mb-6">{l.result}</p>

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

        <Link href="/dashboard"
          className="block text-center bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition">
          {l.back}
        </Link>
      </div>
    </div>
  )
}
