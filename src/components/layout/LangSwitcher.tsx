'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

export default function LangSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname()

  function switchTo(target: Lang) {
    // Vervang /nl/ of /en/ aan het begin van het pad
    return pathname.replace(/^\/(nl|en)/, `/${target}`)
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <Link
        href={switchTo('nl')}
        className={`px-2 py-0.5 rounded transition ${lang === 'nl' ? 'font-bold text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600'}`}
      >
        NL
      </Link>
      <span className="text-gray-300">|</span>
      <Link
        href={switchTo('en')}
        className={`px-2 py-0.5 rounded transition ${lang === 'en' ? 'font-bold text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600'}`}
      >
        EN
      </Link>
    </div>
  )
}
