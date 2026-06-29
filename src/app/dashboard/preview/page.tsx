import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PreviewFrame from './PreviewFrame'

const PAGES = [
  { label: 'Landingspagina', href: '/' },
  { label: 'Inloggen', href: '/login' },
  { label: 'Registreren', href: '/register' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Vragenlijst', href: '/survey' },
]

export default async function PreviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
  if (profiles?.[0]?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Voorbeeldweergave</h1>
        <p className="text-sm text-gray-400 mt-0.5">Bekijk pagina's in mobiel, tablet of desktop formaat</p>
      </div>
      <PreviewFrame pages={PAGES} />
    </div>
  )
}
