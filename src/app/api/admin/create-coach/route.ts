import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function generateCoachCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: Request) {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (profiles?.[0]?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { email, fullName } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-mailadres verplicht' }, { status: 400 })

  const coachCode = generateCoachCode()

  // Check of gebruiker al bestaat
  const { data: existingProfiles } = await supabase.from('profiles').select('id, role').eq('email', email).limit(1)
  const existingProfile = existingProfiles?.[0] ?? null

  if (existingProfile) {
    // Bestaande gebruiker promoveren naar coach
    await supabase.from('profiles').update({
      role: 'coach',
      coach_code: coachCode,
      full_name: fullName || undefined,
    }).eq('id', existingProfile.id)

    return NextResponse.json({ success: true, coachCode, existing: true })
  }

  // Nieuwe coach uitnodigen via magic link
  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: 'coach', coach_code: coachCode },
  })

  if (inviteError || !inviteData?.user) {
    return NextResponse.json({ error: inviteError?.message ?? JSON.stringify(inviteError) ?? 'Uitnodigen mislukt' }, { status: 500 })
  }

  await supabase.from('profiles').upsert({
    id: inviteData.user.id,
    email,
    full_name: fullName,
    role: 'coach',
    coach_code: coachCode,
  })

  return NextResponse.json({ success: true, coachCode, existing: false })
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e)
    console.error('create-coach error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
