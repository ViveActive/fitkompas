'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Plan = {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  badge: string | null
  highlight: boolean
}

const USPs = [
  { icon: '🧭', title: 'Direct inzicht', text: 'Elke respondent krijgt meteen zijn persoonlijk beweegprofiel — jij als coach ziet het resultaat direct.' },
  { icon: '📊', title: 'Groeps­rapportage', text: 'Zie in één oogopslag hoe jouw groep verdeeld is over de vier kwadranten.' },
  { icon: '🔗', title: 'Eigen uitnodigingslink', text: 'Deel jouw unieke coach-code of link en respondenten worden direct aan jou gekoppeld.' },
]

export default function PricingContent({ plans }: { plans: Plan[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(planId: string) {
    setLoading(planId)
    setError(null)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })

    if (res.status === 401) {
      router.push('/register-coach?plan=' + planId)
      return
    }

    const data = await res.json()
    if (!res.ok || !data.url) {
      setError(data.error ?? 'Er ging iets mis. Probeer opnieuw.')
      setLoading(null)
      return
    }

    window.location.href = data.url
  }

  return (
    <>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
        </Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition">Inloggen</Link>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E3A8A] to-[#162d6e] text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Voor coaches & begeleiders
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-5">
            Geef jouw cliënten inzicht.<br />
            <span className="text-[#F47920]">Geef jezelf grip.</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Fitkompas brengt het beweegprofiel van jouw respondenten in kaart — met een wetenschappelijk onderbouwde vragenlijst en direct bruikbare rapportages.
          </p>
        </div>
      </section>

      {/* USPs */}
      <section className="py-14 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {USPs.map(u => (
            <div key={u.title} className="flex flex-col items-center text-center gap-3">
              <div className="text-4xl">{u.icon}</div>
              <h3 className="font-bold text-gray-800">{u.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prijskaarten */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kies jouw plan</h2>
            <p className="text-gray-500">Geen verborgen kosten. Direct aan de slag.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 max-w-md mx-auto text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {plans.map(plan => (
              <div key={plan.id} className={`rounded-2xl flex flex-col relative overflow-hidden transition-shadow hover:shadow-lg ${
                plan.highlight
                  ? 'bg-[#F47920] text-white shadow-xl shadow-orange-100 ring-2 ring-[#F47920]'
                  : 'bg-white border border-gray-100 shadow-sm'
              }`}>
                {plan.badge && (
                  <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl ${
                    plan.highlight ? 'bg-white text-[#F47920]' : 'bg-[#1E3A8A] text-white'
                  }`}>
                    {plan.badge}
                  </div>
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
                  <button
                    onClick={() => handleSelect(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50 ${
                      plan.highlight
                        ? 'bg-white text-[#F47920] hover:bg-orange-50'
                        : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
                    }`}
                  >
                    {loading === plan.id ? 'Bezig...' : 'Begin nu →'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Al een account?{' '}
            <Link href="/login" className="text-[#1E3A8A] hover:underline">Inloggen</Link>
            {' '}·{' '}
            Vragen?{' '}
            <a href="mailto:maarten@viveactive.nl" className="text-[#1E3A8A] hover:underline">Neem contact op</a>
          </p>
        </div>
      </section>

      {/* Afsluiter */}
      <section className="bg-[#1E3A8A] py-14 px-6 text-center text-white mt-auto">
        <div className="max-w-xl mx-auto">
          <p className="text-2xl font-bold mb-3">Klaar om te starten?</p>
          <p className="text-blue-200 mb-6">Registreer je in 2 minuten en stuur je eerste respondent vandaag nog een uitnodiging.</p>
          <button
            onClick={() => handleSelect('bundle_30')}
            className="bg-[#F47920] hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-base transition shadow-lg"
          >
            Ga aan de slag →
          </button>
        </div>
      </section>
    </>
  )
}
