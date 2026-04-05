// src/app/(app)/api/auth/callback/route.ts
//
// Supabase posts back here after:
//   • Email confirmation (new signup)
//   • Password-reset link
//   • Magic-link login
//   • OAuth provider redirect (e.g. Google, GitHub)
//
// The URL arrives with a one-time `code` param (PKCE flow). We exchange it
// for a real session, write the session cookies, then redirect the user.
//
// Flow:
//   Supabase email/OAuth  →  GET /api/auth/callback?code=XXX[&next=/path]
//     ↳ success  →  redirect to `next` (default /dashboard)
//     ↳ failure  →  redirect to /login?error=<reason>

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'

  // ── Sanitise the `next` redirect ───────────────────────────────────────────
  // Only allow relative paths to prevent open-redirect attacks.
  // e.g. ?next=https://evil.com  →  /dashboard
  const next = rawNext.startsWith('/') ? rawNext : '/dashboard'

  // ── No code → nothing to exchange ──────────────────────────────────────────
  if (!code) {
    console.error('[auth/callback] Missing `code` param')
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`
    )
  }

  // ── Build a server Supabase client that can write cookies ──────────────────
  // In Route Handlers (unlike Server Components), cookies() is writable, so
  // we can let @supabase/ssr set the session tokens directly.
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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // ── Exchange the one-time code for a session ───────────────────────────────
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  // ── Success — send the user where they were originally headed ──────────────
  return NextResponse.redirect(`${origin}${next}`)
}