'use client'

import { use, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidLang, type Lang } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

const dicts = {
  nl: {
    logo_sub: 'by ViveActive',
    title: 'Coach account aanmaken',
    chosen_plan: 'Gekozen plan:',
    full_name: 'Volledige naam',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    button: 'Doorgaan naar betaling →',
    loading: 'Bezig...',
    has_account: 'Al een account?',
    login_link: 'Inloggen',
    stripe_note: 'Je wordt doorgestuurd naar Stripe voor veilige betaling.',
    error_failed: 'Betaling starten mislukt. Probeer opnieuw.',
  },
  en: {
    logo_sub: 'by ViveActive',
    title: 'Create coach account',
    chosen_plan: 'Chosen plan:',
    full_name: 'Full name',
    email: 'Email address',
    password: 'Password',
    button: 'Continue to payment →',
    loading: 'Loading...',
    has_account: 'Already have an account?',
    login_link: 'Log in',
    stripe_note: 'You will be redirected to Stripe for secure payment.',
    error_failed: 'Failed to start payment. Please try again.',
  },
}

const planLabels: Record<string, Record<Lang, string>> = {
  bundle_10: { nl: 'Starter — 10 credits (€29)', en: 'Starter — 10 credits (€29)' },
  bundle_30: { nl: 'Pro Bundle — 30 credits (€69)', en: 'Pro Bundle — 30 credits (€69)' },
  subscription_monthly: { nl: 'Maandabonnement (€49/mnd)', en: 'Monthly subscription (€49/mo)' },
  subscription_yearly: { nl: 'Jaarabonnement (€399/jr)', en: 'Annual subscription (€399/yr)' },
}

function RegisterCoachForm({ lang }: { lang: Lang }) {
  const t = dicts[lang]
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'bundle_10'
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
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: 'coach' } },
      })
      if (signUpError || !data.user) {
        setError(signUpError?.message ?? t.error_failed)
        setLoading(false)
        return
      }
      await new Promise(r => setTimeout(r, 500))
    }
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (!res.ok || !data.url) { setError(data.error ?? t.error_failed); setLoading(false); return }
    window.location.href = data.url
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <div className="flex justify-end px-2 pt-4">
        <LangSwitcher lang={lang} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href={`/${lang}`} className="text-3xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </Link>
            <p className="text-gray-500 mt-1 text-sm">{t.logo_sub}</p>
            <p className="text-gray-600 mt-3 font-medium">{t.title}</p>
          </div>

          <div className="bg-[#F47920]/10 border border-[#F47920]/30 rounded-lg px-4 py-3 mb-6 text-sm text-[#F47920] font-medium text-center">
            {t.chosen_plan} {planLabels[plan]?.[lang] ?? plan}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.full_name}</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50">
              {loading ? t.loading : t.button}
            </button>
            <p className="text-center text-sm text-gray-500">
              {t.has_account}{' '}
              <Link href={`/${lang}/login`} className="text-[#1E3A8A] hover:underline font-medium">{t.login_link}</Link>
            </p>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">{t.stripe_note}</p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterCoachPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params)
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'
  return <Suspense><RegisterCoachForm lang={lang} /></Suspense>
}
