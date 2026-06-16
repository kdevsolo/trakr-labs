import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT use getSession() here
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isGuestAuthRoute =
    pathname === '/auth/login' ||
    pathname === '/auth/signup' ||
    pathname === '/auth/forgot-password'

  const isPasswordSetupRoute =
    pathname === '/auth/set-password' ||
    pathname === '/auth/reset-password'

  if (isGuestAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isPasswordSetupRoute && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'session_expired')
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/' && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  } else if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}