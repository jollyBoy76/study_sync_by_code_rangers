import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase.server'
import { TaskProgressBar } from '@/components/tasks/TaskProgressBar'
import { CheckSquare, CalendarDays, Users } from 'lucide-react'

interface GroupOverviewPageProps {
  params: Promise<{ groupId: string }>
}

// ─── Stat Card (Internal Component) ──────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default async function GroupOverviewPage({ params }: GroupOverviewPageProps) {
  const { groupId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  // Parallel data fetching
  // Added error handling to prevent one failing table from crashing the page
  const [tasksRes, eventsRes, membersRes] = await Promise.all([
    supabase.from('tasks').select('status').eq('group_id', groupId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('group_id', groupId).gte('event_date', now), // Use 'event_date'
    supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', groupId),
  ])

  // Extract counts safely
  const tasks = tasksRes.data ?? []
  const upcomingEvents = eventsRes.count ?? 0
  const memberCount = membersRes.count ?? 0

  const total = tasks.length
  // Double check your 'done' status matches your database enum!
  const completed = tasks.filter((t) => t.status === 'done').length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Real-time activity for this study group.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Tasks Summary */}
        <StatCard
          icon={<CheckSquare className="h-4 w-4 text-primary" />}
          label="Tasks Progress"
          value={`${completed} / ${total}`}
          sub={<TaskProgressBar progress={progress} />}
        />

        {/* Events Summary */}
        <StatCard
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          label="Upcoming"
          value={upcomingEvents}
          sub={
            <p className="text-xs text-muted-foreground">
              {upcomingEvents === 0
                ? 'Clear schedule'
                : `${upcomingEvents} event${upcomingEvents === 1 ? '' : 's'} coming up`}
            </p>
          }
        />

        {/* Members Summary */}
        <StatCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Community"
          value={memberCount}
          sub={
            <p className="text-xs text-muted-foreground">
              {memberCount === 1 ? 'Just you so far' : `${memberCount} members active`}
            </p>
          }
        />
      </div>
    </div>
  )
}