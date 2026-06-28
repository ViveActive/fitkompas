'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCoachForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ coachCode: string; existing: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const res = await fetch('/api/admin/create-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Er ging iets mis')
      setLoading(false)
      return
    }

    setResult(data)
    setEmail('')
    setFullName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-700 mb-4">Nieuwe coach toevoegen</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volledige naam</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Jan de Vries"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jan@voorbeeld.nl"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-2">
              {result.existing ? 'Bestaande gebruiker gepromoveerd tot coach!' : 'Coach aangemaakt!'}
            </p>
            <p className="text-xs text-gray-500 mb-1">Coachcode:</p>
            <p className="text-2xl font-bold font-mono text-[#F47920] tracking-widest">{result.coachCode}</p>
            <p className="text-xs text-gray-400 mt-2">
              De coach ontvangt een e-mail om een wachtwoord in te stellen.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50"
        >
          {loading ? 'Bezig...' : 'Coach toevoegen'}
        </button>
      </form>
    </div>
  )
}
