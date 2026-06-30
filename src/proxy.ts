import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_LANG_ROUTES = ['/login', '/register', '/register-coach', '/forgot-password', '/reset-password', '/pricing', '/survey']

function detectLang(request: NextRequest): 'nl' | 'en' {
  const accept = request.headers.get('accept-language') ?? ''
  const preferred = accept.split(',')[0]?.split('-')[0]?.toLowerCase()
  return preferred === 'en' ? 'en' : 'nl'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect root to /nl or /en based on browser language
  if (pathname === '/') {
    const lang = detectLang(request)
    return NextResponse.redirect(new URL(`/${lang}`, request.url))
  }

  // Redirect old root-level public pages to /nl/...
  for (const route of PUBLIC_LANG_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/') || pathname.startsWith(route + '?')) {
      return NextResponse.redirect(new URL(`/nl${pathname}`, request.url))
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/', '/login', '/register', '/register-coach', '/forgot-password', '/reset-password', '/pricing', '/survey', '/dashboard/:path*'],
}
