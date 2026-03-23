import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  console.log('🔒 PROXY TRIGGERED:', request.nextUrl.pathname)

  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ✅ IMPORTANT FIX
  const { data: { user } } = await supabase.auth.getUser()

  console.log('User in proxy:', user ? user.email : 'NO USER')

  // 🔐 Protect dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    console.log('🚫 Not logged in → redirecting')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// ✅ matcher sahi hai
export const config = {
  matcher: ['/dashboard/:path*'],
}