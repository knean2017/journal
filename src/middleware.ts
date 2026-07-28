import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const ADMIN_PATH = (process.env.ADMIN_PATH ?? 'editorial-office').replace(/^\/+|\/+$/g, '')

/**
 * Two jobs.
 *
 * 1. Hide the admin behind a configurable path: `/${ADMIN_PATH}/*` rewrites to
 *    the internal `/admin/*` tree, and a direct request to `/admin/*` 404s.
 *    Obscurity is a second layer here, not the control.
 * 2. Refresh the Supabase session cookie and bounce unauthenticated requests to
 *    the login page. Every admin server action re-checks the session itself,
 *    because middleware alone does not protect a direct POST.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // The internal tree is not addressable from outside.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse(null, { status: 404 })
  }

  const isAdminRequest = pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)
  if (!isAdminRequest) return NextResponse.next()

  const internalPath = pathname.replace(`/${ADMIN_PATH}`, '/admin') || '/admin'

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new NextResponse(
      'Admin unavailable: Supabase credentials are not configured on this deployment.',
      { status: 503, headers: { 'content-type': 'text/plain' } },
    )
  }

  let response = NextResponse.rewrite(new URL(internalPath + search, request.url))

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.rewrite(new URL(internalPath + search, request.url))
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = internalPath === '/admin/login'

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL(`/${ADMIN_PATH}/login`, request.url))
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL(`/${ADMIN_PATH}`, request.url))
  }

  return response
}

/*
 * Anything under `_next`, and anything with a file extension, is a build
 * output or a file in `public/`. None of it can be an admin route, and every
 * request that reaches this function costs a round trip through it, so they
 * are matched out by shape rather than named one at a time.
 */
export const config = {
  matcher: ['/((?!_next/|.*\\.).*)'],
}
