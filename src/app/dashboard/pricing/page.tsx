import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PricingEditor from './PricingEditor'

export default async function AdminPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (myProfile?.[0]?.role !== 'admin') redirect('/dashboard')

  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order')

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prijzen beheren</h1>
        <p className="text-sm text-gray-400 mt-1">
          Pas hier de weergave aan. Vergeet niet ook de prijs in Stripe te wijzigen als je het tarief aanpast.
        </p>
      </div>
      <PricingEditor plans={plans ?? []} />
    </div>
  )
}
