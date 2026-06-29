'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, calculateScores } from '@/lib/questions'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { isValidLang, type Lang } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

const dicts = {
  nl: {
    question_badge: 'Stelling',
    options: [
      { label: 'Helemaal mee eens', value: 2 },
      { label: 'Mee eens', value: 1 },
      { label: 'Neutraal', value: 0 },
      { label: 'Niet mee eens', value: -1 },
      { label: 'Helemaal niet mee eens', value: -2 },
      { label: 'Geen mening', value: -99 },
    ],
    prev: '← Vorige',
    next: 'Volgende →',
    finish: 'Resultaten bekijken ✓',
    saving: 'Opslaan...',
    error_answer: 'Kies een antwoord om door te gaan.',
    question_of: 'van',
    progress: 'ingevuld',
    error_save: 'Er ging iets mis bij het opslaan. Probeer opnieuw.',
    question_key: 'nl' as const,
  },
  en: {
    question_badge: 'Statement',
    options: [
      { label: 'Strongly agree', value: 2 },
      { label: 'Agree', value: 1 },
      { label: 'Neutral', value: 0 },
      { label: 'Disagree', value: -1 },
      { label: 'Strongly disagree', value: -2 },
      { label: 'No opinion', value: -99 },
    ],
    prev: '← Previous',
    next: 'Next →',
    finish: 'View results ✓',
    saving: 'Saving...',
    error_answer: 'Please choose an answer to continue.',
    question_of: 'of',
    progress: 'completed',
    error_save: 'Something went wrong while saving. Please try again.',
    question_key: 'en' as const,
  },
}

export default function LangSurveyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params)
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'
  const t = dicts[lang]

  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = QUESTIONS.length
  const question = QUESTIONS[current]
  const answered = answers[question.id] !== undefined
  const isLast = current === total - 1
  const progress = Math.round(((current + (answered ? 1 : 0)) / total) * 100)

  function handleAnswer(value: number) {
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  function handleNext() {
    if (!answered) { setError(t.error_answer); return }
    setError(null)
    if (isLast) handleSubmit()
    else { setCurrent(c => c + 1); window.scrollTo(0, 0) }
  }

  function handlePrev() {
    if (current > 0) { setCurrent(c => c - 1); window.scrollTo(0, 0) }
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${lang}/login`); return }

    const { x, y, quadrant } = calculateScores(answers)

    const { data: sessions, error: sessionError } = await supabase
      .from('survey_sessions')
      .insert({ coachee_id: user.id, coach_id: null, language: lang, completed_at: new Date().toISOString(), x_score: x, y_score: y, quadrant })
      .select()
      .limit(1)

    if (sessionError || !sessions?.[0]) {
      setError(t.error_save)
      setSaving(false)
      return
    }

    const session = sessions[0]
    const answerRows = Object.entries(answers).map(([qId, value]) => ({
      session_id: session.id,
      question_id: parseInt(qId),
      value,
    }))
    await supabase.from('answers').insert(answerRows)
    router.push(`/${lang}/results/${session.id}`)
  }

  const questionText = (question as unknown as Record<string, string>)[t.question_key] ?? question.nl

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link href={`/${lang}`} className="text-xl font-bold">
          <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
        </Link>
        <div className="flex items-center gap-4">
          <LangSwitcher lang={lang} />
          <span className="text-sm text-gray-400">{current + 1} {t.question_of} {total}</span>
        </div>
      </header>

      <div className="px-6 max-w-3xl mx-auto w-full mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{current + 1} {t.question_of} {total}</span>
          <span>{progress}% {t.progress}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < current ? 'bg-[#1E3A8A]' : i === current ? 'bg-[#F47920]' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8 mb-6">
          <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/8 text-[#1E3A8A] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-5 h-5 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-xs font-bold">{current + 1}</span>
            {t.question_badge}
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed mb-6 sm:mb-8">{questionText}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {t.options.map(option => {
              const selected = answers[question.id] === option.value
              return (
                <button key={option.value} onClick={() => handleAnswer(option.value)}
                  className={`flex-1 py-4 px-2 rounded-xl border-2 transition-all duration-150 text-center text-xs font-medium leading-tight ${
                    selected ? 'border-[#F47920] bg-[#F47920] text-white' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#F47920]/40 hover:bg-orange-50'
                  }`}>
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div className="flex justify-between items-center pb-12">
          <button onClick={handlePrev} disabled={current === 0}
            className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
            {t.prev}
          </button>
          <button onClick={handleNext} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#F47920] hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-100">
            {saving ? t.saving : isLast ? t.finish : t.next}
          </button>
        </div>
      </div>
    </div>
  )
}
