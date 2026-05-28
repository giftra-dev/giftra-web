import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/customer/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if profile exists, create if not (for OAuth users)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Create profile for new OAuth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            role: data.user.user_metadata?.role || 'customer',
          })

        if (profileError) {
          console.error('Failed to create profile:', profileError)
        }
      }

      // Determine redirect based on user role
      const role = existingProfile?.role || data.user.user_metadata?.role || 'customer'
      const redirectPath = next.startsWith('/') ? next : `/${role}/dashboard`
      
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
