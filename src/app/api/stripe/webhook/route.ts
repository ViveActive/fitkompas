import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function generateCoachCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function getUniqueCoachCode(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCoachCode()
    const { data } = await supabase.from('profiles').select('id').eq('coach_code', code).single()
    if (!data) return code
  }
  throw new Error('Could not generate unique coach code')
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (!userId || !plan) return NextResponse.json({ ok: true })

    const coachCode = await getUniqueCoachCode(supabase)
    const isSubscription = plan.startsWith('subscription')

    const { data: planData } = await supabase.from('pricing_plans').select('max_respondents').eq('id', plan).limit(1)
    const credits = planData?.[0]?.max_respondents ?? null
    const expiresAt = credits
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null

    await supabase.from('profiles').update({
      role: 'coach',
      coach_code: coachCode,
    }).eq('id', userId).neq('role', 'admin')

    await supabase.from('coach_subscriptions').insert({
      coach_id: userId,
      plan_type: isSubscription ? 'subscription' : 'bundle',
      plan_name: plan,
      credits_total: credits,
      credits_used: 0,
      expires_at: expiresAt,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string | null,
      status: 'active',
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('coach_subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ ok: true })
}
