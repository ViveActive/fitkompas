'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

type Plan = {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  badge: string | null
  highlight: boolean
  name_en: string | null
  description_en: string | null
  features_en: string[] | null
  period_en: string | null
  badge_en: string | null
}

function localize(plan: Plan, lang: Lang) {
  if (lang === 'nl') return plan
  return {
    ...plan,
    name: plan.name_en ?? plan.name,
    description: plan.description_en ?? plan.description,
    features: plan.features_en ?? plan.features,
    period: plan.period_en ?? plan.period,
    badge: plan.badge_en ?? plan.badge,
  }
}

const dicts = {
  nl: {
    header_login: 'Inloggen',
    for_coaches: 'Voor coaches & begeleiders',
    hero_title: 'Geef jouw cliënten inzicht.',
    hero_title_highlight: 'Geef jezelf grip.',
    hero_sub: 'Fitkompas brengt het beweegprofiel van jouw respondenten in kaart — met een wetenschappelijk onderbouwde vragenlijst en direct bruikbare rapportages.',
    usps: [
      { icon: '🧭', title: 'Direct inzicht', text: 'Elke respondent krijgt meteen zijn persoonlijk beweegprofiel — jij als coach ziet het resultaat direct.' },
      { icon: '📊', title: 'Groepsrapportage', text: 'Zie in één oogopslag hoe jouw groep verdeeld is over de vier kwadranten.' },
      { icon: '🔗', title: 'Eigen uitnodigingslink', text: 'Deel jouw unieke coach-code of link en respondenten worden direct aan jou gekoppeld.' },
    ],
    plans_title: 'Kies jouw plan',
    plans_sub: 'Geen verborgen kosten. Direct aan de slag.',
    button: 'Begin nu →',
    loading: 'Bezig...',
    already_account: 'Al een account?',
    login_link: 'Inloggen',
    questions: 'Vragen?',
    contact_link: 'Neem contact op',
    cta_title: 'Klaar om te starten?',
    cta_sub: 'Registreer je in 2 minuten en stuur je eerste respondent vandaag nog een uitnodiging.',
    cta_button: 'Ga aan de slag →',
    error: 'Er ging iets mis. Probeer opnieuw.',
  },
  en: {
    header_login: 'Log in',
    for_coaches: 'For coaches & practitioners',
    hero_title: 'Give your clients insight.',
    hero_title_highlight: 'Give yourself control.',
    hero_sub: 'Fitkompas maps the movement profile of your respondents — with a scientifically based questionnaire and immediately usable reports.',
    usps: [
      { icon: '🧭', title: 'Immediate insight', text: 'Every respondent immediately receives their personal movement profile — you as coach see the result right away.' },
      { icon: '📊', title: 'Group report', text: 'See at a glance how your group is distributed across the four quadrants.' },
      { icon: '🔗', title: 'Your own invite link', text: 'Share your unique coach code or link and respondents are linked directly to you.' },
    ],
    plans_title: 'Choose your plan',
    plans_sub: 'No hidden costs. Get started right away.',
    button: 'Start now →',
    loading: 'Loading...',
    already_account: 'Already have an account?',
    login_link: 'Log in',
    questions: 'Questions?',
    contact_link: 'Contact us',
    cta_title: 'Ready to get started?',
    cta_sub: 'Register in 2 minutes and send your first respondent an invitation today.',
    cta_button: 'Get started →',
    error: 'Something went wrong. Please try again.',
  },
}

export default function LangPricingContent({ plans, lang }: { plans: Plan[], lang: Lang }) {
  const t = dicts[lang]
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const localizedPlans = plans.map(p => localize(p, lang))

  async function handleSelect(planId: string) {
    setLoading(planId)
    setError(null)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    if (res.status === 401) { router.push(`/${lang}/register-coach?plan=${planId}`); return }
    const data = await res.json()
    if (!res.ok || !data.url) { setError(data.error ?? t.error); setLoading(null); return }
    window.location.href = data.url
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href={`/${lang}`} className="text-2xl font-bold">
          <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
        </Link>
        <Link href={`/${lang}/login`} className="text-sm text-gray-500 hover:text-gray-800 transition">{t.header_login}</Link>
      </header>

      <section className="bg-gradient-to-b from-[#1E3A8A] to-[#162d6e] text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            {t.for_coaches}
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-5">
            {t.hero_title}<br /><span className="text-[#F47920]">{t.hero_title_highlight}</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">{t.hero_sub}</p>
        </div>
      </section>

      <section className="py-14 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.usps.map(u => (
            <div key={u.title} className="flex flex-col items-center text-center gap-3">
              <div className="text-4xl">{u.icon}</div>
              <h3 className="font-bold text-gray-800">{u.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.plans_title}</h2>
            <p className="text-gray-500">{t.plans_sub}</p>
          </div>
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 max-w-md mx-auto text-center">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {localizedPlans.map(plan => (
              <div key={plan.id} className={`rounded-2xl flex flex-col relative overflow-hidden transition-shadow hover:shadow-lg ${
                plan.highlight ? 'bg-[#F47920] text-white shadow-xl shadow-orange-100 ring-2 ring-[#F47920]' : 'bg-white border border-gray-100 shadow-sm'
              }`}>
                {plan.badge && (
                  <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl ${
                    plan.highlight ? 'bg-white text-[#F47920]' : 'bg-[#1E3A8A] text-white'
                  }`}>{plan.badge}</div>
                )}
                <div className="p-6 flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-5 ${plan.highlight ? 'text-orange-100' : 'text-gray-400'}`}>{plan.description}</p>
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ml-1 ${plan.highlight ? 'text-orange-100' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f: string) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-orange-50' : 'text-gray-600'}`}>
                        <span className={`mt-0.5 font-bold ${plan.highlight ? 'text-white' : 'text-[#F47920]'}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  <button onClick={() => handleSelect(plan.id)} disabled={loading === plan.id}
                    className={`w-full font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50 ${
                      plan.highlight ? 'bg-white text-[#F47920] hover:bg-orange-50' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
                    }`}>
                    {loading === plan.id ? t.loading : t.button}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            {t.already_account}{' '}
            <Link href={`/${lang}/login`} className="text-[#1E3A8A] hover:underline">{t.login_link}</Link>
            {' '}·{' '}
            {t.questions}{' '}
            <a href="mailto:maarten@viveactive.nl" className="text-[#1E3A8A] hover:underline">{t.contact_link}</a>
          </p>
        </div>
      </section>

      <section className="bg-[#1E3A8A] py-14 px-6 text-center text-white mt-auto">
        <div className="max-w-xl mx-auto">
          <p className="text-2xl font-bold mb-3">{t.cta_title}</p>
          <p className="text-blue-200 mb-6">{t.cta_sub}</p>
          <button onClick={() => handleSelect('bundle_30')}
            className="bg-[#F47920] hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-base transition shadow-lg">
            {t.cta_button}
          </button>
        </div>
      </section>
    </div>
  )
}
