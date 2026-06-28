import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateToken(length = 32) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = profiles?.[0]?.role
  if (role !== 'coach' && role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-mailadres verplicht' }, { status: 400 })

  // Check credits (alleen voor coaches, admin heeft geen limiet)
  if (role === 'coach') {
    const { data: subs } = await supabase
      .from('coach_subscriptions')
      .select('credits_total, credits_used')
      .eq('coach_id', user.id)
      .eq('status', 'active')
      .limit(1)

    const sub = subs?.[0]
    if (!sub) return NextResponse.json({ error: 'Geen actief abonnement' }, { status: 403 })
    if (sub.credits_total !== null && sub.credits_used >= sub.credits_total) {
      return NextResponse.json({ error: `Je hebt je limiet van ${sub.credits_total} vragenlijsten bereikt` }, { status: 403 })
    }
  }

  // Check of er al een ongebruikte token is voor dit e-mailadres
  const { data: existing } = await supabase
    .from('invite_tokens')
    .select('token')
    .eq('coach_id', user.id)
    .eq('email', email.toLowerCase())
    .eq('used', false)
    .limit(1)

  if (existing?.[0]) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${existing[0].token}`
    return NextResponse.json({ token: existing[0].token, url })
  }

  const token = generateToken()

  const { error } = await supabase.from('invite_tokens').insert({
    token,
    coach_id: user.id,
    email: email.toLowerCase(),
  })

  if (error) return NextResponse.json({ error: 'Kon uitnodiging niet aanmaken' }, { status: 500 })

  // Credits ophogen (alleen als er een limiet is)
  if (role === 'coach') {
    const { data: subs } = await supabase
      .from('coach_subscriptions')
      .select('id, credits_total, credits_used')
      .eq('coach_id', user.id)
      .eq('status', 'active')
      .limit(1)
    const sub = subs?.[0]
    if (sub?.credits_total !== null && sub) {
      await supabase.from('coach_subscriptions')
        .update({ credits_used: sub.credits_used + 1 })
        .eq('id', sub.id)
    }
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`
  return NextResponse.json({ token, url })
}
