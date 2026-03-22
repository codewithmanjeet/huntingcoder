// proxy.ts  (root folder mein)

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  console.log('🔒 PROXY TRIGGERED for path:', request.nextUrl.pathname)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  const { data: { session } } = await supabase.auth.getSession()

  // DEBUG LINES – yahan add kiya (session check ke baad)
  console.log('Session in proxy:', session ? 'YES' : 'NO')
  if (session) {
    console.log('User email:', session.user.email)
  }

  // Dashboard protection
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    console.log('🚫 No session → Redirecting to /login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

// Config – sirf dashboard protect kar raha hai
export const config = {
  matcher: ['/dashboard/:path*'],
}