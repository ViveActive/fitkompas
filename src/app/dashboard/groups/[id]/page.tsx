import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GroupMemberManager from './GroupMemberManager'

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  const role = myProfile?.[0]?.role
  if (role !== 'admin' && role !== 'coach') redirect('/dashboard')

  const { data: groupArr } = await supabase.from('groups').select('id, name, description').eq('id', id).limit(1)
  const group = groupArr?.[0]
  if (!group) redirect('/dashboard/groups')

  // Huidige leden
  const { data: members } = await supabase
    .from('profile_groups')
    .select('profile_id, profiles(id, full_name, email, role)')
    .eq('group_id', id)

  // Alle beschikbare profielen (respondenten + coaches)
  const profileQuery = supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['respondent', 'coach'])
    .order('full_name')
  if (role === 'coach') profileQuery.eq('coach_id', user.id)
  const { data: allProfiles } = await profileQuery

  const memberIds = new Set(members?.map((m: any) => m.profile_id) ?? [])

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/groups" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Terug naar groepen
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
        {group.description && <p className="text-sm text-gray-400 mt-1">{group.description}</p>}
        <p className="text-xs text-gray-300 mt-2">{memberIds.size} leden</p>
      </div>

      <GroupMemberManager
        groupId={id}
        allProfiles={allProfiles ?? []}
        memberIds={[...memberIds]}
      />
    </div>
  )
}
