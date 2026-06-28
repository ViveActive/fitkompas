import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CoacheesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role

  if (role !== 'admin' && role !== 'coach') redirect('/dashboard')

  const query = supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('role', 'coachee')
    .order('created_at', { ascending: false })

  if (role === 'coach') query.eq('coach_id', user.id)

  const { data: coachees } = await query

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {role === 'admin' ? 'Alle respondenten' : 'Mijn respondenten'}
        </h1>
        {role === 'coach' && (
          <Link href="/dashboard/invite"
            className="bg-[#F47920] hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Uitnodigen
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {coachees?.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Nog geen respondenten.</p>
            {role === 'coach' && (
              <Link href="/dashboard/invite" className="mt-3 inline-block text-sm text-[#1E3A8A] hover:underline">
                Eerste respondent uitnodigen →
              </Link>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {coachees?.map((c: any) => (
            <Link key={c.id} href={`/dashboard/coachees/${c.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <div>
                <p className="text-sm font-medium text-gray-800">{c.full_name ?? c.email}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('nl-NL')}
                </p>
                <span className="text-xs text-[#1E3A8A]">Bekijk →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
