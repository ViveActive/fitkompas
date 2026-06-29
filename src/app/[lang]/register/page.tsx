'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidLang, type Lang } from '@/lib/i18n'

const dicts = {
  nl: {
    logo_sub: 'by ViveActive',
    title: 'Account aanmaken',
    title_invited: 'Je bent uitgenodigd — maak een account aan',
    invite_banner: 'Persoonlijke uitnodiging voor',
    full_name: 'Volledige naam',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    code_label: 'Code',
    code_optional: '(optioneel)',
    code_placeholder: 'bijv. ABC123',
    code_hint: 'Heb je een code ontvangen? Vul die hier in.',
    button: 'Account aanmaken',
    loading: 'Bezig...',
    has_account: 'Al een account?',
    login_link: 'Inloggen',
    error_invalid_token: 'Deze uitnodigingslink is ongeldig of al gebruikt.',
    error_email_mismatch: 'Dit e-mailadres komt niet overeen met de uitnodiging.',
    error_in_use: 'Dit e-mailadres is al in gebruik. Probeer in te loggen.',
    error_generic: 'Er is een fout opgetreden. Probeer opnieuw.',
  },
  en: {
    logo_sub: 'by ViveActive',
    title: 'Create account',
    title_invited: "You've been invited — create an account",
    invite_banner: 'Personal invitation for',
    full_name: 'Full name',
    email: 'Email address',
    password: 'Password',
    code_label: 'Code',
    code_optional: '(optional)',
    code_placeholder: 'e.g. ABC123',
    code_hint: 'Have you received a code? Enter it here.',
    button: 'Create account',
    loading: 'Loading...',
    has_account: 'Already have an account?',
    login_link: 'Log in',
    error_invalid_token: 'This invitation link is invalid or has already been used.',
    error_email_mismatch: 'This email address does not match the invitation.',
    error_in_use: 'This email address is already in use. Try logging in.',
    error_generic: 'Something went wrong. Please try again.',
  },
}

function RegisterForm({ lang }: { lang: Lang }) {
  const t = dicts[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [coachCode, setCoachCode] = useState('')
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [inviteLocked, setInviteLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    const code = searchParams.get('code')
    if (token) {
      setInviteToken(token)
      const supabase = createClient()
      supabase.from('invite_tokens').select('email').eq('token', token).eq('used', false).limit(1)
        .then(({ data }) => {
          if (data?.[0]) { setEmail(data[0].email); setInviteLocked(true) }
          else setError(t.error_invalid_token)
        })
    } else if (code) {
      setCoachCode(code.toUpperCase())
    }
  }, [searchParams])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    let coachId: string | null = null

    if (inviteToken) {
      const { data: tokens } = await supabase.from('invite_tokens').select('coach_id, email').eq('token', inviteToken).eq('used', false).limit(1)
      if (!tokens?.[0]) { setError(t.error_invalid_token); setLoading(false); return }
      if (tokens[0].email !== email.toLowerCase()) { setError(t.error_email_mismatch); setLoading(false); return }
      coachId = tokens[0].coach_id
    } else if (coachCode.trim()) {
      const { data: coaches } = await supabase.from('profiles').select('id').eq('coach_code', coachCode.trim().toUpperCase()).eq('role', 'coach').limit(1)
      if (!coaches || coaches.length === 0) { setError('Ongeldige code.'); setLoading(false); return }
      coachId = coaches[0].id
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: 'respondent', coach_id: coachId } },
    })

    if (signUpError) { setError(signUpError.message || t.error_generic); setLoading(false); return }
    if (!data.user) { setError(t.error_in_use); setLoading(false); return }

    await new Promise(r => setTimeout(r, 800))
    await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role: 'respondent', coach_id: coachId })

    if (inviteToken) {
      await supabase.from('invite_tokens').update({ used: true, used_by: data.user.id, used_at: new Date().toISOString() }).eq('token', inviteToken)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">{t.logo_sub}</p>
            <p className="text-gray-500 mt-3">{inviteToken ? t.title_invited : t.title}</p>
          </div>

          {inviteToken && inviteLocked && (
            <div className="bg-[#1E3A8A]/8 border border-[#1E3A8A]/20 text-[#1E3A8A] text-sm rounded-xl px-4 py-3 mb-4 text-center">
              {t.invite_banner} <strong>{email}</strong>
            </div>
          )}

          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.full_name}</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input type="email" required value={email} onChange={e => !inviteLocked && setEmail(e.target.value)} readOnly={inviteLocked}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${inviteLocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            {!inviteToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.code_label} <span className="text-gray-400 font-normal">{t.code_optional}</span>
                </label>
                <input type="text" value={coachCode} onChange={e => setCoachCode(e.target.value.toUpperCase())}
                  placeholder={t.code_placeholder}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] uppercase font-mono tracking-widest" />
                <p className="text-xs text-gray-400 mt-1">{t.code_hint}</p>
              </div>
            )}
            <button type="submit" disabled={loading || (!!inviteToken && !inviteLocked)}
              className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50">
              {loading ? t.loading : t.button}
            </button>
            <p className="text-center text-sm text-gray-500">
              {t.has_account}{' '}
              <Link href={`/${lang}/login`} className="text-[#1E3A8A] hover:underline font-medium">{t.login_link}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params)
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'nl'
  return <Suspense><RegisterForm lang={lang} /></Suspense>
}
