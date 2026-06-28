'use client'

import { useState } from 'react'

export default function CoachNotes({ coachId, initialNotes }: { coachId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch(`/api/coaches/${coachId}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700">Opmerkingen</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
            saved ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
          }`}
        >
          {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Opslaan'}
        </button>
      </div>
      <textarea
        rows={5}
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        placeholder="Aantekeningen over deze coach..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
      />
    </div>
  )
}
