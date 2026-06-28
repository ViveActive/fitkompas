import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
  bundle_10: process.env.STRIPE_BUNDLE_10_PRICE_ID!,
  bundle_30: process.env.STRIPE_BUNDLE_30_PRICE_ID!,
  subscription_monthly: process.env.STRIPE_SUB_MONTHLY_PRICE_ID!,
  subscription_yearly: process.env.STRIPE_SUB_YEARLY_PRICE_ID!,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { plan } = await req.json()
  const priceId = PRICE_MAP[plan]
  if (!priceId) return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 })

  const isSubscription = plan.startsWith('subscription')

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/register-coach?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { user_id: user.id, plan },
    customer_email: user.email,
  })

  return NextResponse.json({ url: session.url })
}
