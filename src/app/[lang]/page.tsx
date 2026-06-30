import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, isValidLang, type Lang } from '@/lib/i18n'
import Link from 'next/link'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  if (!isValidLang(rawLang)) redirect('/nl')
  const lang = rawLang as Lang
  const d = await getDictionary(lang)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
    const role = profiles?.[0]?.role
    if (role !== 'admin') redirect('/dashboard')
    isAdmin = true
  }

  const t = d.home

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Admin balk */}
      {isAdmin && (
        <div className="bg-[#1E3A8A] text-white text-xs px-6 py-2 flex items-center justify-between">
          <span className="opacity-60">{d.common.admin_preview}</span>
          <Link href="/dashboard" className="font-semibold hover:underline">
            {d.common.back_to_dashboard}
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div>
          <div className="text-2xl font-bold">
            <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
          </div>
          <p className="text-xs text-gray-400">{d.common.by_viveactive}</p>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher lang={lang} />
          <Link href={`/${lang}/login`} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 transition">
            {t.nav_login}
          </Link>
          <Link href={`/${lang}/pricing`} className="text-sm bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition font-medium">
            {t.nav_coaches}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 sm:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#F47920]/10 text-[#F47920] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            {t.hero_badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t.hero_title}<br />
            <span className="text-[#F47920]">{t.hero_title_highlight}</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto">
            {t.hero_sub}
          </p>
          <div className="flex justify-center">
            <Link
              href={`/${lang}/register`}
              className="bg-[#F47920] hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-orange-200"
            >
              {t.hero_cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Foto sectie */}
      <section className="bg-white py-10 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { file: '/hardlopen.jpg', label: t.photos[0] },
            { file: '/strand.jpg', label: t.photos[1] },
            { file: '/fietspad.jpg', label: t.photos[2] },
          ].map(({ file, label }) => (
            <div key={file} className="rounded-2xl overflow-hidden aspect-[4/3] relative group shadow-sm">
              <img src={file} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-semibold text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wat is Fitkompas */}
      <section className="bg-blue-50 py-10 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t.usp_title}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t.usp_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.usp_items.map(({ icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kwadrant preview */}
      <section className="bg-white py-10 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t.quadrant_title}<br />{t.quadrant_title2}
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">{t.quadrant_sub}</p>
            <Link href={`/${lang}/register`} className="inline-block bg-[#F47920] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
              {t.quadrant_cta}
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 relative">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
                <div className="bg-[#1E3A8A]/10 rounded-tl-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#1E3A8A] leading-tight">{t.quadrant_labels[0]}</span>
                </div>
                <div className="bg-[#F47920]/10 rounded-tr-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#F47920] leading-tight">{t.quadrant_labels[1]}</span>
                </div>
                <div className="bg-[#F47920]/10 rounded-bl-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#F47920] leading-tight">{t.quadrant_labels[2]}</span>
                </div>
                <div className="bg-gray-100 rounded-br-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-gray-400 leading-tight">{t.quadrant_labels[3]}</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-gray-100">🧭</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E3A8A] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.cta_title}</h2>
          <p className="text-blue-200 mb-8 text-lg">{t.cta_sub}</p>
          <Link href={`/${lang}/register`} className="inline-block bg-[#F47920] hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-base transition shadow-lg">
            {t.cta_button}
          </Link>
          <p className="text-blue-300 mt-6 text-sm">
            {t.cta_coach}{' '}
            <Link href={`/${lang}/pricing`} className="text-white font-semibold hover:underline">{t.cta_coach_link}</Link>
          </p>
        </div>
      </section>

      <footer className="bg-gray-50 px-6 py-8 text-center text-sm text-gray-400">
        {d.footer.copyright}
      </footer>
    </div>
  )
}
