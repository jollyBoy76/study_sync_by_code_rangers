// src/app/(app)/dashboard/page.tsx

'use client'

import { useUser } from '@/hooks/useUser'
import { useGroups } from '@/hooks/useGroups'
import { useMyTasks } from '@/hooks/useMyTasks'
import { useAllEvents } from '@/hooks/useAllEvents'
import { TaskProgressBar } from '@/components/tasks/TaskProgressBar'
import { DueSoonList } from '@/components/tasks/DueSoonList'
import { CheckSquare, Users, CalendarDays, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      <div className="h-8 w-56 rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }                  = useUser()
  const { groups,  loading: lg }  = useGroups()
  const { tasks,   loading: lt }  = useMyTasks()
  const { events,  loading: le }  = useAllEvents()

  const loading = lg || lt || le

  if (loading) return <DashboardSkeleton />

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTasks     = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgress     = totalTasks - completedTasks

  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date(new Date().toDateString())
  ).length

  // First name only for greeting
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'User';


  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {greeting()}, {capitalizedName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {todayLabel()}
            </p>
          </div>
          
        </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Groups"
          value={groups.length}
          sub={groups.length === 1 ? '1 group joined' : `${groups.length} groups joined`}
        />
        <StatCard
          icon={<CheckSquare className="h-3.5 w-3.5" />}
          label="Total tasks"
          value={totalTasks}
          sub={`${inProgress} in progress`}
        />
        <StatCard
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Completed"
          value={completedTasks}
          sub={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% done` : 'No tasks yet'}
        />
        <StatCard
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Upcoming"
          value={upcomingEvents}
          sub={upcomingEvents === 1 ? '1 event ahead' : `${upcomingEvents} events ahead`}
        />
      </div>

      {/* ── Bottom two columns ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Groups with progress */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Your Groups
            </p>
            <Link
              href="/groups"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-center">
              <p className="text-sm text-muted-foreground">No groups yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((group) => {
                const groupTasks    = tasks.filter((t) => (t as any).group_id === group.id)
                const groupDone     = groupTasks.filter((t) => t.status === 'done').length
                const groupProgress = groupTasks.length === 0
                  ? 0
                  : Math.round((groupDone / groupTasks.length) * 100)

                return (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4
                               hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: group.color ?? '#888' }}
                        />
                        <span className="text-sm font-medium truncate">{group.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {groupDone}/{groupTasks.length} tasks
                      </span>
                    </div>
                    <TaskProgressBar progress={groupProgress} />
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Due soon */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Due Soon
            </p>
            <Link
              href="/tasks"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <DueSoonList tasks={tasks as any} />
        </section>

      </div>
    </div>
    </div>
  )
}