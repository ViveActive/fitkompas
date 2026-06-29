'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
    { href: '/dashboard/preview', label: '📱 Voorbeeldweergave' },
  ],
  coach: [
    { href: '/dashboard', label: 'Overzicht' },
    { href: '/dashboard/coachees', label: 'Mijn respondenten' },
    { href: '/dashboard/groups', label: 'Groepen' },
    { href: '/dashboard/reports', label: 'Rapportage' },
    { href: '/dashboard/sessions', label: 'Alle sessies' },
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
  const [open, setOpen] = useState(false)
  const items = NAV[role] ?? NAV.respondent

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm transition ${
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
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-bold text-[#F47920]">Fit</span>
          <span className="text-xl font-bold text-[#1E3A8A]">kompas</span>
          <p className="text-xs text-gray-400 mt-0.5">by ViveActive</p>
        </div>
        {navContent}
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <div>
          <span className="text-lg font-bold text-[#F47920]">Fit</span>
          <span className="text-lg font-bold text-[#1E3A8A]">kompas</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-in menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <aside
            className="absolute top-0 left-0 w-64 h-full bg-white flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-[#F47920]">Fit</span>
                <span className="text-xl font-bold text-[#1E3A8A]">kompas</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
