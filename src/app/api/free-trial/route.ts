import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function generateCoachCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

async function getUniqueCoachCode(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCoachCode()
    const { data } = await supabase.from('profiles').select('id').eq('coach_code', code).limit(1)
    if (!data?.length) return code
  }
  throw new Error('Could not generate unique coach code')
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const admin = createAdminClient()

  // Voorkom dubbele activatie
  const { data: existing } = await admin
    .from('coach_subscriptions')
    .select('id')
    .eq('coach_id', user.id)
    .limit(1)

  if (existing?.length) {
    return NextResponse.json({ error: 'Al een actief abonnement' }, { status: 409 })
  }

  const coachCode = await getUniqueCoachCode(admin)

  await admin.from('profiles').update({
    role: 'coach',
    coach_code: coachCode,
  }).eq('id', user.id)

  await admin.from('coach_subscriptions').insert({
    coach_id: user.id,
    plan_type: 'bundle',
    plan_name: 'free_trial',
    credits_total: 2,
    credits_used: 0,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: null,
    stripe_subscription_id: null,
    status: 'active',
  })

  return NextResponse.json({ ok: true })
}
