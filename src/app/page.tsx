import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profiles } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1)
    const role = profiles?.[0]?.role
    if (role !== 'admin') {
      redirect('/dashboard')
    }
    isAdmin = true
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Admin balk */}
      {isAdmin && (
        <div className="bg-[#1E3A8A] text-white text-xs px-6 py-2 flex items-center justify-between">
          <span className="opacity-60">Voorbeeldweergave als admin</span>
          <Link href="/dashboard" className="font-semibold hover:underline">
            ← Terug naar dashboard
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="text-2xl font-bold">
          <span className="text-[#F47920]">Fit</span><span className="text-[#1E3A8A]">kompas</span>
          <span className="text-gray-400 text-sm font-normal ml-2">by ViveActive</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 transition">
            Inloggen
          </Link>
          <Link href="/pricing" className="text-sm bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition font-medium">
            Voor coaches
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 sm:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#F47920]/10 text-[#F47920] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Jouw persoonlijke beweegprofiel
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Met inzicht op de juiste koers<br />
            <span className="text-[#F47920]">naar een gezonde leefstijl</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto">
            Fitkompas brengt jouw beweeggedrag en motivatie in kaart. In 15 minuten weet je waar je staat — en wat je in beweging zet.
          </p>

          <div className="flex justify-center">
            <Link
              href="/register"
              className="bg-[#F47920] hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-orange-200"
            >
              Start de vragenlijst →
            </Link>
          </div>
        </div>
      </section>

      {/* Foto sectie */}
      <section className="bg-white py-10 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { file: '/hardlopen.jpg', label: 'In beweging' },
            { file: '/strand.jpg', label: 'Samen op koers' },
            { file: '/fietspad.jpg', label: 'Jouw richting' },
          ].map(({ file, label }) => (
            <div key={file} className="rounded-2xl overflow-hidden aspect-[4/3] relative group shadow-sm">
              <img
                src={file}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-semibold text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wat is Fitkompas */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Inzicht dat activeert</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Fitkompas laat zien hoe jij je verhoudt tot bewegen — niet met een oordeel, maar met een kompas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧭',
                title: 'Jouw profiel',
                text: 'Via 60 stellingen brengen we jouw beweeggedrag en motivatie in kaart op een 2x2 kwadrant.',
              },
              {
                icon: '💡',
                title: 'Helder inzicht',
                text: 'Je ziet direct waar je staat: actief of passief, gemotiveerd of nog niet. Geen oordeel, wel richting.',
              },
              {
                icon: '🏃',
                title: 'In beweging',
                text: 'Met jouw profiel geeft jouw coach je gerichte begeleiding die echt bij jou past.',
              },
            ].map(({ icon, title, text }) => (
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
              Vier profielen,<br />één kompas
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Fitkompas plaatst je in één van vier kwadranten op basis van je gedrag en motivatie. Zo weet jij — en je coach — precies wat de beste aanpak voor jou is.
            </p>
            <Link
              href="/register"
              className="inline-block bg-[#F47920] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
            >
              Doe de vragenlijst
            </Link>
          </div>

          {/* Kompas visualisatie */}
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 relative">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
                <div className="bg-[#1E3A8A]/10 rounded-tl-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#1E3A8A] leading-tight">Actief &<br/>Gemotiveerd</span>
                </div>
                <div className="bg-[#F47920]/10 rounded-tr-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#F47920] leading-tight">Actief &<br/>Ongemotiveerd</span>
                </div>
                <div className="bg-[#F47920]/10 rounded-bl-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-[#F47920] leading-tight">Passief &<br/>Gemotiveerd</span>
                </div>
                <div className="bg-gray-100 rounded-br-2xl flex items-center justify-center text-center p-3">
                  <span className="text-xs font-semibold text-gray-400 leading-tight">Passief &<br/>Ongemotiveerd</span>
                </div>
              </div>
              {/* Kompas naald in het midden */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-gray-100">
                  🧭
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E3A8A] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om jouw koers te bepalen?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Heb je een code van je coach? Registreer je dan en begin direct.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#F47920] hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-base transition shadow-lg"
          >
            Start nu →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 px-6 py-8 text-center text-sm">
        <span className="font-bold text-gray-500">ViveActive</span>
        <span className="text-gray-400"> © 2026</span>
      </footer>
    </div>
  )
}
