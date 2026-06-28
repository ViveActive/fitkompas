import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RegisterCoachSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, coach_code, role')
    .eq('id', user.id)
    .single()

  // Als webhook nog niet verwerkt is, geef een paar seconden de tijd
  if (profile?.role !== 'coach') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Betaling verwerken…</h1>
          <p className="text-gray-500 mb-6">Je betaling is ontvangen. Je account wordt nu ingericht. Ververs de pagina over een paar seconden.</p>
          <Link href="/dashboard/register-coach" className="text-[#1E3A8A] hover:underline text-sm">
            Pagina vernieuwen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welkom bij Fitkompas!</h1>
        <p className="text-gray-500 mb-6">
          Je coach account is aangemaakt. Deel jouw code met respondenten zodat zij aan jou gekoppeld worden.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mb-6 text-left">
          <p className="text-sm text-gray-500 mb-2">Jouw coachcode</p>
          <p className="text-4xl font-bold font-mono text-[#F47920] tracking-widest text-center py-2">
            {profile.coach_code}
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Stuur deze code naar je respondenten bij de uitnodigingslink
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-block bg-[#1E3A8A] hover:bg-blue-900 text-white font-medium rounded-lg px-6 py-3 text-sm transition"
        >
          Naar mijn dashboard →
        </Link>
      </div>
    </div>
  )
}
