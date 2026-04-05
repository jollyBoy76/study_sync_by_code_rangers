// src/app/(app)/layout.tsx
//
// Shell for every authenticated page.
// Three-column layout:  Sidebar | main content | RightPanel
//
// Both Sidebar and RightPanel are async Server Components that run their own
// Supabase queries. We wrap each in <Suspense> so the page content can stream
// in without waiting for the panels — and so Next.js can render each panel
// independently with its own loading state.

import { Suspense, type ReactNode } from 'react'
import { Sidebar }    from '@/components/layout/Sidebar'

// ─── Suspense Fallbacks ────────────────────────────────────────────────────────
// Mirror the exact width/border of the real components so the layout doesn't
// shift when they swap in.

function SidebarSkeleton() {
  return (
    <aside className="w-[220px] min-w-[220px] h-full flex flex-col border-r border-border bg-background">
      {/* Logo bar */}
      <div className="px-4 py-4 border-b border-border space-y-1.5">
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <div className="h-2 w-32 rounded bg-muted animate-pulse" />
      </div>
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="h-7 rounded-md bg-muted animate-pulse" />
      </div>
      {/* Nav items */}
      <div className="px-3 pb-1 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
      {/* Group list */}
      <div className="flex-1 px-3 py-2 space-y-1.5">
        <div className="h-2 w-16 rounded bg-muted animate-pulse mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
      {/* Profile row */}
      <div className="px-3 py-3 border-t border-border flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-muted animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
          <div className="h-2 w-28 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </aside>
  )
}

function RightPanelSkeleton() {
  return (
    <aside className="w-[210px] min-w-[210px] h-full border-l border-border bg-background">
      {/* Calendar block */}
      <div className="px-4 pt-4 pb-3 border-b border-border space-y-2">
        <div className="h-2 w-20 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded-md bg-muted animate-pulse" />
      </div>
      {/* Upcoming events */}
      <div className="px-4 py-3 space-y-2">
        <div className="h-2 w-16 rounded bg-muted animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    </aside>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Left: Sidebar ─────────────────────────────────────────────────── */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      {/* ── Centre: page content ──────────────────────────────────────────── */}
      {/* min-w-0 prevents flex children from overflowing the container       */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}