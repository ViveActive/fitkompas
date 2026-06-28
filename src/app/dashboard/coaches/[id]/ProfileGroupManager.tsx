'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Group = { id: string; name: string }

export default function ProfileGroupManager({
  profileId,
  allGroups,
  memberGroupIds,
}: {
  profileId: string
  allGroups: Group[]
  memberGroupIds: string[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(memberGroupIds))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/profiles/${profileId}/groups`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupIds: [...selected] }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  if (allGroups.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Groepen</h2>
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
      <div className="flex flex-wrap gap-2">
        {allGroups.map(g => {
          const active = selected.has(g.id)
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
                active
                  ? 'border-[#F47920] bg-[#F47920]/8 text-[#F47920]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {active && <span className="mr-1">✓</span>}{g.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
