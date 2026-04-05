// middleware.ts
//
// Runs on every request that matches the `config.matcher` below.
// Responsibilities:
//   1. Refresh the Supabase session cookie so it never expires mid-visit.
//   2. Guard every route inside /(app) — redirect unauthenticated users to /login.
//   3. Redirect already-authenticated users away from /(auth) pages to /dashboard.
//   4. Let everything else (static assets, API routes, auth callback) pass through.
//
// Performance note:
//   We use getSession() here instead of getUser() intentionally.
//   getUser() makes a network round-trip to Supabase on every request which
//   adds 200-500ms per navigation. getSession() reads the local cookie which
//   is instant. Individual page components that need verified user data still
//   call getUser() via createClient() from supabase.server.ts.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Route Classification ──────────────────────────────────────────────────────

/** Routes that require a valid session. Prefix-matched. */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/groups',
  '/tasks',
  '/profile',
  '/calendar',
]

/** Routes only for unauthenticated users (redirect away if already signed in). */
const AUTH_ROUTES = ['/login', '/signup', '/sign-up']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession() for route guarding — reads local cookie, no network call.
  // Individual server components call getUser() when they need verified data.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const { pathname } = request.nextUrl

  // ── Guard: unauthenticated user hitting a protected route ──────────────────
  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Guard: authenticated user hitting an auth page ─────────────────────────
  if (user && isAuthRoute(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

// ─── Matcher ───────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)).*)',
  ],
}
