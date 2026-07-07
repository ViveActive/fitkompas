import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  await supabase.from('profiles').select('id').limit(1)
  return Response.json({ ok: true })
}
