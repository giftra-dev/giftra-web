import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasSupabaseConfig, isDemoAuthAllowed } from './config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase is configured - if not, allow demo mode
  const protectedPaths = ['/customer', '/artist', '/admin', '/chat']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!hasSupabaseConfig) {
    if (!isProtectedPath) {
      return supabaseResponse
    }

    if (isDemoAuthAllowed && request.cookies.has('giftra_demo_role')) {
      return supabaseResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const requiredRole = request.nextUrl.pathname.startsWith('/admin')
    ? 'admin'
    : request.nextUrl.pathname.startsWith('/artist')
      ? 'artist'
      : request.nextUrl.pathname.startsWith('/customer')
        ? 'customer'
        : null

  if (user && requiredRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (role && role !== requiredRole) {
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
