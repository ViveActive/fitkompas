import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (myProfile?.[0]?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { groupIds } = await req.json()

  await supabase.from('profile_groups').delete().eq('profile_id', profileId)

  if (groupIds.length > 0) {
    await supabase.from('profile_groups').insert(
      groupIds.map((gid: string) => ({ profile_id: profileId, group_id: gid }))
    )
  }

  return NextResponse.json({ ok: true })
}
