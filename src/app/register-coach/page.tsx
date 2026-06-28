'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Footer from '@/components/layout/Footer'

function RegisterCoachForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'bundle_10'

  const [step, setStep] = useState<'account' | 'paying'>('account')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Probeer eerst in te loggen (account bestaat al?)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      // Maak nieuw account aan
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'coach' } },
      })

      if (signUpError || !data.user) {
        setError(signUpError?.message ?? 'Registratie mislukt. Probeer opnieuw.')
        setLoading(false)
        return
      }

      // Wacht even zodat de trigger het profiel aanmaakt
      await new Promise(r => setTimeout(r, 500))
    }

    // Stuur naar Stripe checkout
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    const data = await res.json()
    if (!res.ok || !data.url) {
      setError(data.error ?? 'Betaling starten mislukt. Probeer opnieuw.')
      setLoading(false)
      return
    }

    window.location.href = data.url
  }

  const planLabels: Record<string, string> = {
    bundle_10: 'Starter — 10 credits (€29)',
    bundle_30: 'Pro Bundle — 30 credits (€69)',
    subscription_monthly: 'Maandabonnement (€49/mnd)',
    subscription_yearly: 'Jaarabonnement (€399/jr)',
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </Link>
            <p className="text-gray-500 mt-1 text-sm">by ViveActive</p>
          <p className="text-gray-600 mt-3 font-medium">Coach account aanmaken</p>
        </div>

        <div className="bg-[#F47920]/10 border border-[#F47920]/30 rounded-lg px-4 py-3 mb-6 text-sm text-[#F47920] font-medium text-center">
          Gekozen plan: {planLabels[plan] ?? plan}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volledige naam</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50"
          >
            {loading ? 'Bezig...' : 'Doorgaan naar betaling →'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Al een account?{' '}
            <Link href={`/login?redirect=/pricing`} className="text-[#1E3A8A] hover:underline font-medium">
              Inloggen
            </Link>
          </p>
        </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Je wordt doorgestuurd naar Stripe voor veilige betaling.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function RegisterCoachPage() {
  return (
    <Suspense>
      <RegisterCoachForm />
    </Suspense>
  )
}
