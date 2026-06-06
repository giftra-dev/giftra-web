import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function redirectWithCookies(
  request: NextRequest,
  cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
  url: string
) {
  const response = NextResponse.redirect(url)
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  return response
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const signupRole = searchParams.get('signup_role')
  const requestedRole = signupRole === 'artist' || signupRole === 'customer' ? signupRole : null
  const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(items) {
            cookiesToSet.push(...items)
          },
        },
      },
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if profile exists, create if not (for OAuth users)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existingProfile) {
        // Create profile for new OAuth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            role: requestedRole || data.user.user_metadata?.role || 'customer',
          })

        if (profileError) {
          console.error('Failed to create profile:', profileError)
        }
      }

      // Determine redirect based on user role
      const role = existingProfile?.role || requestedRole || data.user.user_metadata?.role || 'customer'
      const redirectPath = next?.startsWith('/') && !next.startsWith('//') ? next : `/${role}/dashboard`
      
      return redirectWithCookies(request, cookiesToSet, `${origin}${redirectPath}`)
    }
  }

  return redirectWithCookies(request, cookiesToSet, `${origin}/auth/error`)
}
