import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (myProfile?.[0]?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const { error } = await supabase.from('pricing_plans').update({
    name: body.name,
    price: body.price,
    period: body.period,
    description: body.description,
    features: body.features,
    stripe_price_id: body.stripe_price_id,
    badge: body.badge,
    highlight: body.highlight,
    max_respondents: body.max_respondents ?? null,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
