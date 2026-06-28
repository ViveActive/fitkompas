import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import { type Role } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role={(profile?.role ?? 'coachee') as Role}
        name={profile?.full_name ?? profile?.email ?? user.email ?? ''}
      />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
