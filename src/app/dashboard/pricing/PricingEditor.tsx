'use client'

import { useState } from 'react'

type Plan = {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  stripe_price_id: string | null
  badge: string | null
  highlight: boolean
  max_respondents: number | null
}

function PlanCard({ plan, onSave }: { plan: Plan; onSave: (p: Plan) => Promise<void> }) {
  const [data, setData] = useState(plan)
  const [featuresText, setFeaturesText] = useState(plan.features.join('\n'))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const updated = { ...data, features: featuresText.split('\n').map(f => f.trim()).filter(Boolean) }
    await onSave(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function set(field: keyof Plan, value: any) {
    setData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${data.highlight ? 'border-[#F47920]' : 'border-transparent'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">{data.id}</span>
          {data.highlight && <span className="text-xs bg-[#F47920]/10 text-[#F47920] font-semibold px-2 py-1 rounded-full">Uitgelicht</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'}`}
        >
          {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Opslaan'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Naam</label>
          <input value={data.name} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Omschrijving</label>
          <input value={data.description} onChange={e => set('description', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Prijs (weergave)</label>
          <input value={data.price} onChange={e => set('price', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Periode</label>
          <input value={data.period} onChange={e => set('period', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Badge <span className="text-gray-300">(optioneel)</span></label>
          <input value={data.badge ?? ''} onChange={e => set('badge', e.target.value || null)}
            placeholder="bijv. Meest gekozen"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Stripe Price ID</label>
          <input value={data.stripe_price_id ?? ''} onChange={e => set('stripe_price_id', e.target.value || null)}
            placeholder="price_..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Max vragenlijsten <span className="text-gray-300">(leeg = onbeperkt)</span></label>
          <input
            type="number"
            value={data.max_respondents ?? ''}
            onChange={e => set('max_respondents', e.target.value === '' ? null : parseInt(e.target.value))}
            placeholder="bijv. 30"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1">Features <span className="text-gray-300">(één per regel)</span></label>
        <textarea rows={4} value={featuresText} onChange={e => { setFeaturesText(e.target.value); setSaved(false) }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={data.highlight} onChange={e => set('highlight', e.target.checked)}
          className="rounded" />
        Uitlichten (oranje rand)
      </label>
    </div>
  )
}

export default function PricingEditor({ plans }: { plans: Plan[] }) {
  async function savePlan(plan: Plan) {
    await fetch(`/api/pricing-plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    })
  }

  return (
    <div className="space-y-5">
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} onSave={savePlan} />
      ))}
    </div>
  )
}
