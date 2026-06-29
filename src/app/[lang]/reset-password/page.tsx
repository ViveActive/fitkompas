'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidLang, type Lang } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

const dicts = {
  nl: {
    logo_sub: 'by ViveActive',
    title: 'Nieuw wachtwoord instellen',
    new_password: 'Nieuw wachtwoord',
    confirm_password: 'Bevestig wachtwoord',
    button: 'Wachtwoord opslaan →',
    loading: 'Bezig...',
    error_mismatch: 'Wachtwoorden komen niet overeen.',
    error_length: 'Wachtwoord moet minimaal 8 tekens zijn.',
    error_failed: 'Er ging iets mis. Probeer de resetlink opnieuw aan te vragen.',
  },
  en: {
    logo_sub: 'by ViveActive',
    title: 'Set new password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    button: 'Save password →',
    loading: 'Loading...',
    error_mismatch: 'Passwords do not match.',
    error_length: 'Password must be at least 8 characters.',
    error_failed: 'Something went wrong. Please request a new reset link.',
  },
}

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params)
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'
  const t = dicts[lang]

  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError(t.error_mismatch); return }
    if (password.length < 8) { setError(t.error_length); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(t.error_failed); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const eyeOff = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  )
  const eyeOn = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

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
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.new_password}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirm_password}</label>
              <input type={showPassword ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50">
              {loading ? t.loading : t.button}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
