'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Profile = { id: string; full_name: string | null; email: string; role: string }

export default function GroupMemberManager({
  groupId,
  allProfiles,
  memberIds,
}: {
  groupId: string
  allProfiles: Profile[]
  memberIds: string[]
}) {
  const router = useRouter()
  const [members, setMembers] = useState<Set<string>>(new Set(memberIds))
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  const filtered = allProfiles.filter(p => {
    const q = search.toLowerCase()
    return (p.full_name ?? '').toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setMembers(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberIds: [...members] }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    }
  }

  const respondents = filtered.filter(p => p.role === 'respondent')
  const coaches = filtered.filter(p => p.role === 'coach')

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Leden beheren</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
            saved ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
          }`}
        >
          {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Opslaan'}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Zoek op naam of e-mail..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] mb-5"
      />

      {coaches.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Coaches</p>
          <div className="space-y-2">
            {coaches.map(p => (
              <ProfileRow key={p.id} profile={p} checked={members.has(p.id)} onToggle={() => toggle(p.id)} />
            ))}
          </div>
        </div>
      )}

      {respondents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Respondenten</p>
          <div className="space-y-2">
            {respondents.map(p => (
              <ProfileRow key={p.id} profile={p} checked={members.has(p.id)} onToggle={() => toggle(p.id)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Geen resultaten gevonden.</p>
      )}
    </div>
  )
}

function ProfileRow({ profile, checked, onToggle }: { profile: Profile; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${
        checked ? 'border-[#F47920] bg-[#F47920]/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
        checked ? 'border-[#F47920] bg-[#F47920]' : 'border-gray-300'
      }`}>
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{profile.full_name ?? profile.email}</p>
        <p className="text-xs text-gray-400">{profile.email}</p>
      </div>
    </button>
  )
}
