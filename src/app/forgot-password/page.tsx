'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Footer from '@/components/layout/Footer'

export default function ForgotPasswordPage() {
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
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('Er ging iets mis. Controleer je e-mailadres en probeer opnieuw.')
      setLoading(false)
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">by ViveActive</p>
            <p className="text-gray-500 mt-3">Wachtwoord vergeten</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">📬</div>
                <p className="font-semibold text-gray-800">Controleer je inbox</p>
                <p className="text-sm text-gray-500">
                  Als <span className="font-medium text-gray-700">{email}</span> bij ons bekend is, ontvang je een e-mail met een link om je wachtwoord opnieuw in te stellen.
                </p>
                <Link href="/login" className="block text-sm text-[#1E3A8A] hover:underline mt-4">
                  Terug naar inloggen
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-500">
                  Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
                </p>

                {error && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
                )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Bezig...' : 'Stuur resetlink →'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  <Link href="/login" className="text-[#1E3A8A] hover:underline">
                    Terug naar inloggen
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
