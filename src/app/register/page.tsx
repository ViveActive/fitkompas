'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'
import Footer from '@/components/layout/Footer'
import AdminPreviewBar from '@/components/layout/AdminPreviewBar'

function RegisterForm() {
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

  const setErrorSafe = (e: unknown) => {
    if (!e) { setError(null); return }
    if (typeof e === 'string' && e.trim() && e !== '{}') setError(e)
    else if (e instanceof Error && e.message) setError(e.message)
    else setError('Er is een fout opgetreden. Probeer opnieuw.')
  }

  useEffect(() => {
    const token = searchParams.get('token')
    const code = searchParams.get('code')

    if (token) {
      // Valideer token en haal e-mail op
      setInviteToken(token)
      const supabase = createClient()
      supabase
        .from('invite_tokens')
        .select('email')
        .eq('token', token)
        .eq('used', false)
        .limit(1)
        .then(({ data }) => {
          if (data?.[0]) {
            setEmail(data[0].email)
            setInviteLocked(true)
          } else {
            setError('Deze uitnodigingslink is ongeldig of al gebruikt.')
          }
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
      // Valideer token opnieuw en haal coach_id op
      const { data: tokens } = await supabase
        .from('invite_tokens')
        .select('coach_id, email')
        .eq('token', inviteToken)
        .eq('used', false)
        .limit(1)

      if (!tokens?.[0]) {
        setError('Deze uitnodigingslink is ongeldig of al gebruikt.')
        setLoading(false)
        return
      }

      if (tokens[0].email !== email.toLowerCase()) {
        setError('Dit e-mailadres komt niet overeen met de uitnodiging.')
        setLoading(false)
        return
      }

      coachId = tokens[0].coach_id

    } else if (coachCode.trim()) {
      const { data: coaches } = await supabase
        .from('profiles')
        .select('id')
        .eq('coach_code', coachCode.trim().toUpperCase())
        .eq('role', 'coach')
        .limit(1)

      if (!coaches || coaches.length === 0) {
        setError('Ongeldige code. Controleer de code en probeer opnieuw.')
        setLoading(false)
        return
      }
      coachId = coaches[0].id
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'respondent', coach_id: coachId },
      },
    })

    if (signUpError) {
      setErrorSafe(signUpError.message || 'Registratie mislukt. Probeer opnieuw.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setErrorSafe('Dit e-mailadres is al in gebruik. Probeer in te loggen.')
      setLoading(false)
      return
    }

    // Wacht even zodat de trigger het profiel aanmaakt
    await new Promise(r => setTimeout(r, 800))

    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'respondent',
      coach_id: coachId,
    })

    // Markeer token als gebruikt
    if (inviteToken) {
      await supabase.from('invite_tokens').update({
        used: true,
        used_by: data.user.id,
        used_at: new Date().toISOString(),
      }).eq('token', inviteToken)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <AdminPreviewBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">by ViveActive</p>
            <p className="text-gray-500 mt-3">
              {inviteToken ? 'Je bent uitgenodigd — maak een account aan' : 'Account aanmaken'}
            </p>
          </div>

          {inviteToken && inviteLocked && (
            <div className="bg-[#1E3A8A]/8 border border-[#1E3A8A]/20 text-[#1E3A8A] text-sm rounded-xl px-4 py-3 mb-4 text-center">
              Persoonlijke uitnodiging voor <strong>{email}</strong>
            </div>
          )}

          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow p-8 space-y-5">
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
                onChange={e => !inviteLocked && setEmail(e.target.value)}
                readOnly={inviteLocked}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${inviteLocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
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

            {!inviteToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-gray-400 font-normal">(optioneel)</span>
                </label>
                <input
                  type="text"
                  value={coachCode}
                  onChange={e => setCoachCode(e.target.value.toUpperCase())}
                  placeholder="bijv. ABC123"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] uppercase font-mono tracking-widest"
                />
                <p className="text-xs text-gray-400 mt-1">Heb je een code ontvangen? Vul die hier in.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!!inviteToken && !inviteLocked)}
              className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Bezig...' : 'Account aanmaken'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Al een account?{' '}
              <Link href="/login" className="text-[#1E3A8A] hover:underline font-medium">
                Inloggen
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
