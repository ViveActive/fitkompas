'use client'

import { useState } from 'react'

type InviteResult = { email: string; url: string; error?: string }

export default function InvitePage() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single')

  // Enkel
  const [email, setEmail] = useState('')
  const [singleResult, setSingleResult] = useState<InviteResult | null>(null)
  const [singleCopied, setSingleCopied] = useState(false)

  // Bulk
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResults, setBulkResults] = useState<InviteResult[]>([])
  const [allCopied, setAllCopied] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateOne(emailAddr: string): Promise<InviteResult> {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddr }),
    })
    const data = await res.json()
    if (!res.ok) return { email: emailAddr, url: '', error: data.error ?? 'Mislukt' }
    return { email: emailAddr, url: data.url }
  }

  async function handleSingle(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSingleResult(null)
    const result = await generateOne(email)
    if (result.error) setError(result.error)
    else setSingleResult(result)
    setLoading(false)
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setBulkResults([])

    const emails = bulkInput
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'))

    if (emails.length === 0) {
      setError('Geen geldige e-mailadressen gevonden.')
      setLoading(false)
      return
    }

    const results: InviteResult[] = []
    for (const addr of emails) {
      const r = await generateOne(addr)
      results.push(r)
    }
    setBulkResults(results)
    setLoading(false)
  }

  function copySingle() {
    if (!singleResult) return
    navigator.clipboard.writeText(singleResult.url)
    setSingleCopied(true)
    setTimeout(() => setSingleCopied(false), 2000)
  }

  function copyAll() {
    const text = bulkResults
      .filter(r => !r.error)
      .map(r => `${r.email}\t${r.url}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2000)
  }

  function downloadCSV() {
    const rows = ['Email,Link', ...bulkResults.filter(r => !r.error).map(r => `${r.email},${r.url}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'uitnodigingen.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Respondenten uitnodigen</h1>
      <p className="text-sm text-gray-400 mb-6">
        Elke link is persoonlijk en werkt maar één keer.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('single')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${mode === 'single' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
        >
          Één persoon
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${mode === 'bulk' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
        >
          Meerdere personen
        </button>
      </div>

      {/* Enkel */}
      {mode === 'single' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSingle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres respondent</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Bezig...' : 'Genereer link'}
            </button>
          </form>

          {singleResult && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Link voor <span className="text-[#1E3A8A]">{singleResult.email}</span>
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-sm font-mono text-[#1E3A8A] break-all leading-relaxed">{singleResult.url}</p>
              </div>
              <button
                onClick={copySingle}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition ${singleCopied ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'}`}
              >
                {singleCopied ? '✓ Gekopieerd!' : 'Kopieer link'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk */}
      {mode === 'bulk' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleBulk} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mailadressen <span className="text-gray-400 font-normal">(één per regel, of kommagescheiden)</span>
              </label>
              <textarea
                required
                rows={6}
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                placeholder={'jan@example.nl\npiet@example.nl\nklaas@example.nl'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                {bulkInput.split(/[\n,;]+/).filter(e => e.trim().includes('@')).length} e-mailadressen herkend
              </p>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F47920] hover:bg-orange-600 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Bezig met genereren...' : 'Genereer alle links'}
            </button>
          </form>

          {bulkResults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">
                  {bulkResults.filter(r => !r.error).length} links gegenereerd
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={copyAll}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${allCopied ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'}`}
                  >
                    {allCopied ? '✓ Gekopieerd!' : 'Kopieer alles'}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                  >
                    Download CSV
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {bulkResults.map((r, i) => (
                  <div key={i} className={`rounded-xl p-3 ${r.error ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="text-xs font-semibold text-gray-600 mb-1">{r.email}</p>
                    {r.error
                      ? <p className="text-xs text-red-500">{r.error}</p>
                      : <p className="text-xs font-mono text-[#1E3A8A] break-all">{r.url}</p>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
