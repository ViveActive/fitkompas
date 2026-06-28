'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPreviewBar() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
      if (data?.[0]?.role === 'admin') setIsAdmin(true)
    })
  }, [])

  if (!isAdmin) return null

  return (
    <div className="bg-[#1E3A8A] text-white text-xs px-6 py-2 flex items-center justify-between">
      <span className="opacity-60">Voorbeeldweergave als admin</span>
      <Link href="/dashboard" className="font-semibold hover:underline">
        ← Terug naar dashboard
      </Link>
    </div>
  )
}
