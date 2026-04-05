// src/app/(app)/groups/[groupId]/layout.tsx
//
// Nested layout for every page inside a group:
//   /groups/[groupId]/tasks
//   /groups/[groupId]/resources
//   /groups/[groupId]/calendar
//
// Structure (renders inside the <main> of the app shell):
//
//   ┌─────────────────────────────────────────┬──────────────┐
//   │ GroupHeader (name · member count)        │              │
//   ├─────────────────────────────────────────┤  RightPanel  │
//   │ GroupTabs  (Tasks | Resources | Calendar)│  (groupId)   │
//   ├─────────────────────────────────────────┤              │
//   │ {children} — page content               │  • calendar  │
//   │                                         │  • events    │
//   │                                         │  • members   │
//   └─────────────────────────────────────────┴──────────────┘
//
// Data fetching:
//   - Group name + description fetched here (Server Component, one query).
//   - Member count fetched here alongside the group.
//   - RightPanel fetches its own events + members independently in parallel.
//
// Auth:
//   - Middleware already guarantees a valid session by the time we get here.
//   - We still check group membership so a user can't access a group they
//     haven't joined by navigating directly to the URL.

import { Suspense, type ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase.server'
import { GroupHeader } from '@/components/layout/GroupHeader'
import { GroupTabs }   from '@/components/group/GroupTabs'
import { RightPanel }  from '@/components/layout/RightPanel'

// ─── Skeletons ────────────────────────────────────────────────────────────────

function GroupHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
      <div className="space-y-1.5">
        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
        <div className="h-7 w-20 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function RightPanelSkeleton() {
  return (
    <aside className="w-[210px] min-w-[210px] h-full border-l border-border bg-background">
      <div className="px-4 pt-4 pb-3 border-b border-border space-y-2">
        <div className="h-2 w-20 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-2 w-16 rounded bg-muted animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-2 w-14 rounded bg-muted animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    </aside>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface GroupLayoutProps {
  children: ReactNode
  params: Promise<{ groupId: string }>
}

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  const { groupId } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Should never be null (middleware guards this), but be explicit.
  if (!user) redirect('/login')

  // ── Fetch group + membership in a single round-trip ───────────────────────
  const [{ data: group }, { count: memberCount }, { data: membership }] =
    await Promise.all([
      supabase
        .from('groups')
        .select('id, name, description, color, created_by')
        .eq('id', groupId)
        .single(),

      supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId),

      // Verify the current user is actually a member of this group
      supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

  // Group doesn't exist → 404
  if (!group) notFound()

  // User isn't a member → 404 (don't leak the group name to non-members)
  if (!membership) notFound()

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">

      {/* ── Centre column: header + tabs + scrollable page content ─────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* GroupHeader: static data, no loading state needed */}
        <Suspense fallback={<GroupHeaderSkeleton />}>
          <GroupHeader
            groupId={groupId}
            createdBy={group.created_by}
            name={group.name}
            memberCount={memberCount ?? 0}
          />
        </Suspense>

        {/* GroupTabs: client component, renders instantly */}
        <GroupTabs groupId={groupId} />

        {/* Page content: each page has its own Suspense / loading.tsx */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>

      {/* ── Right column: group-scoped calendar, events, and member list ── */}
      <Suspense fallback={<RightPanelSkeleton />}>
        <RightPanel groupId={groupId} />
      </Suspense>

    </div>
  )
}