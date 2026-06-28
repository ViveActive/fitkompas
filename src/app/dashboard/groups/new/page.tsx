'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Er ging iets mis.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/groups/${data.id}`)
  }

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/groups" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nieuwe groep</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="bijv. Bedrijf X — Afdeling Sales"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Omschrijving <span className="text-gray-400 font-normal">(optioneel)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="bijv. Pilotgroep Q3 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50"
          >
            {loading ? 'Bezig...' : 'Groep aanmaken'}
          </button>
        </form>
      </div>
    </div>
  )
}
