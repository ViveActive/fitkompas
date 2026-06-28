'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Role } from '@/types'

const NAV = {
  admin: [
    { href: '/dashboard', label: 'Overzicht' },
    { href: '/dashboard/coaches', label: 'Coaches' },
    { href: '/dashboard/coachees', label: 'Respondenten' },
    { href: '/dashboard/groups', label: 'Groepen' },
    { href: '/dashboard/sessions', label: 'Alle sessies' },
    { href: '/dashboard/reports', label: 'Rapportages' },
    { href: '/', label: '↗ Landingspagina' },
    { href: '/register', label: '↗ Registratie respondent' },
    { href: '/survey', label: '↗ Vragenlijst (preview)' },
    { href: '/pricing', label: '↗ Pricing pagina' },
    { href: '/dashboard/pricing', label: 'Prijzen beheren' },
  ],
  coach: [
    { href: '/dashboard', label: 'Overzicht' },
    { href: '/dashboard/coachees', label: 'Mijn respondenten' },
    { href: '/dashboard/groups', label: 'Groepen' },
    { href: '/dashboard/reports', label: 'Rapportage' },
    { href: '/dashboard/invite', label: 'Uitnodigen' },
    { href: '/dashboard/account', label: 'Mijn account' },
  ],
  respondent: [
    { href: '/dashboard', label: 'Mijn resultaten' },
    { href: '/survey', label: 'Vragenlijst invullen' },
  ],
}

export default function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname()
  const items = NAV[role] ?? NAV.respondent

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-[#F47920]">Fit</span>
        <span className="text-xl font-bold text-[#1E3A8A]">kompas</span>
        <p className="text-xs text-gray-400 mt-0.5">by ViveActive</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname === item.href
                ? 'bg-[#1E3A8A] text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 truncate">{name}</p>
        <p className="text-xs text-gray-400 capitalize">{role}</p>
        <form action="/api/auth/logout" method="POST" className="mt-2">
          <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition">
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  )
}
