import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = profiles?.[0]?.role
  if (role !== 'admin' && role !== 'coach') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'Naam verplicht' }, { status: 400 })

  const { data, error } = await supabase
    .from('groups')
    .insert({ name, description: description || null, created_by: user.id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'Aanmaken mislukt' }, { status: 500 })
  return NextResponse.json(data)
}
