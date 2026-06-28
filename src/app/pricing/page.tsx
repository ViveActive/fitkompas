import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/layout/Footer'
import AdminPreviewBar from '@/components/layout/AdminPreviewBar'
import PricingContent from './PricingContent'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminPreviewBar />
      <PricingContent plans={plans ?? []} />
      <Footer />
    </div>
  )
}
