import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = profiles?.[0]?.role
  if (role !== 'admin' && role !== 'coach') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { memberIds } = await req.json()

  // Verwijder alle huidige leden en zet nieuwe lijst
  await supabase.from('profile_groups').delete().eq('group_id', groupId)

  if (memberIds.length > 0) {
    const rows = memberIds.map((pid: string) => ({ profile_id: pid, group_id: groupId }))
    const { error } = await supabase.from('profile_groups').insert(rows)
    if (error) return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
