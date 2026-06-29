'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidLang, type Lang } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

const dicts = {
  nl: {
    logo_sub: 'by ViveActive',
    title: 'Wachtwoord vergeten',
    intro: 'Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.',
    email: 'E-mailadres',
    button: 'Stuur resetlink →',
    loading: 'Bezig...',
    back: 'Terug naar inloggen',
    sent_title: 'Controleer je inbox',
    sent_text: 'Als',
    sent_text2: 'bij ons bekend is, ontvang je een e-mail met een link om je wachtwoord opnieuw in te stellen.',
    error: 'Er ging iets mis. Controleer je e-mailadres en probeer opnieuw.',
  },
  en: {
    logo_sub: 'by ViveActive',
    title: 'Forgot password',
    intro: "Enter your email address and we'll send you a link to reset your password.",
    email: 'Email address',
    button: 'Send reset link →',
    loading: 'Loading...',
    back: 'Back to login',
    sent_title: 'Check your inbox',
    sent_text: 'If',
    sent_text2: "is known to us, you'll receive an email with a link to reset your password.",
    error: 'Something went wrong. Check your email address and try again.',
  },
}

export default function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params)
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'
  const t = dicts[lang]

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${lang}/reset-password`,
    })
    if (error) { setError(t.error); setLoading(false); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <div className="flex justify-end px-2 pt-4">
        <LangSwitcher lang={lang} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">{t.logo_sub}</p>
            <p className="text-gray-500 mt-3">{t.title}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">📬</div>
                <p className="font-semibold text-gray-800">{t.sent_title}</p>
                <p className="text-sm text-gray-500">
                  {t.sent_text} <span className="font-medium text-gray-700">{email}</span> {t.sent_text2}
                </p>
                <Link href={`/${lang}/login`} className="block text-sm text-[#1E3A8A] hover:underline mt-4">{t.back}</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-500">{t.intro}</p>
                {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50">
                  {loading ? t.loading : t.button}
                </button>
                <p className="text-center text-sm text-gray-500">
                  <Link href={`/${lang}/login`} className="text-[#1E3A8A] hover:underline">{t.back}</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
