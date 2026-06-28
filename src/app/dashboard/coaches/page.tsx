import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateCoachForm from './CreateCoachForm'
import Link from 'next/link'

export default async function CoachesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: coaches } = await supabase
    .from('profiles')
    .select('id, full_name, email, coach_code, created_at')
    .eq('role', 'coach')
    .order('created_at', { ascending: false })

  const coacheesPerCoach: Record<string, number> = {}
  if (coaches && coaches.length > 0) {
    const { data: counts } = await supabase
      .from('profiles')
      .select('coach_id')
      .eq('role', 'respondent')
      .in('coach_id', coaches.map(c => c.id))

    counts?.forEach((r: any) => {
      coacheesPerCoach[r.coach_id] = (coacheesPerCoach[r.coach_id] ?? 0) + 1
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coaches</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          {coaches?.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">Nog geen coaches.</p>
            </div>
          )}
          <div className="divide-y divide-gray-50">
            {coaches?.map((c: any) => (
              <Link key={c.id} href={`/dashboard/coaches/${c.id}`} className="block px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.full_name ?? c.email}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                    {c.coach_code && (
                      <span className="mt-1 inline-block text-xs font-mono bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-0.5 rounded">
                        {c.coach_code}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-700">{coacheesPerCoach[c.id] ?? 0}</p>
                    <p className="text-xs text-gray-400">respondenten</p>
                    <p className="text-xs text-[#1E3A8A] mt-1">Bekijk →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <CreateCoachForm />
      </div>
    </div>
  )
}
