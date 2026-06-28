import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = myProfile?.[0]?.role
  if (role !== 'admin' && role !== 'coach') redirect('/dashboard')

  const groupQuery = supabase
    .from('groups')
    .select('id, name, description, created_at')
    .order('name')
  if (role === 'coach') groupQuery.eq('created_by', user.id)
  const { data: groups } = await groupQuery

  // Aantal leden per groep
  const groupIds = groups?.map(g => g.id) ?? []
  const { data: memberCounts } = groupIds.length > 0
    ? await supabase.from('profile_groups').select('group_id').in('group_id', groupIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  memberCounts?.forEach((r: any) => {
    countMap[r.group_id] = (countMap[r.group_id] ?? 0) + 1
  })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Groepen</h1>
          <p className="text-sm text-gray-400 mt-1">Groepeer coaches en respondenten voor gefilterde rapportages</p>
        </div>
        <Link
          href="/dashboard/groups/new"
          className="bg-[#F47920] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          + Nieuwe groep
        </Link>
      </div>

      {groups?.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          Nog geen groepen aangemaakt.
          <div className="mt-3">
            <Link href="/dashboard/groups/new" className="text-[#1E3A8A] hover:underline">
              Maak je eerste groep →
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {groups?.map((g: any) => (
          <Link
            key={g.id}
            href={`/dashboard/groups/${g.id}`}
            className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-4 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-800">{g.name}</p>
              {g.description && <p className="text-sm text-gray-400 mt-0.5">{g.description}</p>}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>{countMap[g.id] ?? 0} leden</span>
              <span className="text-[#1E3A8A]">Beheer →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
