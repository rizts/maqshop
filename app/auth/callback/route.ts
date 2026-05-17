import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash') || requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('from') || '/'
  const error_desc = requestUrl.searchParams.get('error_description')
  const error_code = requestUrl.searchParams.get('error')

  if (error_desc || error_code) {
    console.error('Auth callback error:', error_desc || error_code)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error_desc || 'Gagal memverifikasi tautan. Tautan mungkin telah kedaluwarsa.')}`)
  }
  
  if (code || (token_hash && type)) {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore if called from server component
            }
          },
        },
      }
    )

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })
      
      if (error) {
        console.error('Verify OTP error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Gagal memverifikasi tautan aktivasi. Tautan mungkin telah kedaluwarsa.')}`)
      }
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Exchange code error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Gagal memverifikasi kode autentikasi. Kode mungkin tidak valid.')}`)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
