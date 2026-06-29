import { createClient } from '@/lib/supabase/server'
import { isValidLang, type Lang } from '@/lib/i18n'
import { redirect } from 'next/navigation'
import LangPricingContent from './LangPricingContent'

export default async function LangPricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  if (!isValidLang(rawLang)) redirect('/nl/pricing')
  const lang = rawLang as Lang

  const supabase = await createClient()
  const { data: plans } = await supabase.from('pricing_plans').select('*').order('sort_order')

  return <LangPricingContent plans={plans ?? []} lang={lang} />
}
