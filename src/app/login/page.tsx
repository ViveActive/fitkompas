'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mailadres of wachtwoord klopt niet.')
      setLoading(false)
      return
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
            <p className="text-gray-500 mt-1 text-sm">by ViveActive</p>
            <p className="text-gray-500 mt-3">Inloggen</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow p-8 space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Bezig...' : 'Inloggen'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Nog geen account?{' '}
              <Link href="/register" className="text-[#1E3A8A] hover:underline font-medium">
                Registreren
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
