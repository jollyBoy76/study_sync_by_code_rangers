import { supabaseClient as supabase } from '@/lib/supabase.client'
import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import { UpcomingEvents } from "@/components/calendar/UpcomingEvents";
import { Avatar } from "@/components/ui/Avatar";
import { OnlineDot } from "@/components/ui/OnlineDot";

interface RightPanelProps {
  groupId?: string;
}

export async function RightPanel({ groupId }: RightPanelProps) {

  // Upcoming events — scoped to group or all user groups
  let eventsQuery = supabase
    .from("events")
    .select("id, title, event_date, color, group_id")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(2);

  if (groupId) eventsQuery = eventsQuery.eq("group_id", groupId);

  const { data: events } = await eventsQuery;

  // All events for the current month — for dot markers
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  let monthEventsQuery = supabase
    .from("events")
    .select("event_date")
    .gte("event_date", firstOfMonth)
    .lte("event_date", lastOfMonth);

  if (groupId) monthEventsQuery = monthEventsQuery.eq("group_id", groupId);

  const { data: monthEvents } = await monthEventsQuery;
  const eventDays = new Set(monthEvents?.map((e) => e.event_date) ?? []);

  // Group members (only when inside a group)
  let members: { user_id: string; profiles: { full_name: string | null } | null }[] = [];
  if (groupId) {
    const { data } = await supabase
      .from("group_members")
      .select("user_id, profiles(full_name)")
      .eq("group_id", groupId)
      .limit(6);
    members = (data as any) ?? [];
  }

  return (
    <aside className="w-[210px] min-w-[210px] h-full flex flex-col bg-background border-l border-border overflow-y-auto">

      {/* Mini calendar */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
          {now.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
        <MiniCalendar eventDays={eventDays} />
      </div>

      {/* Upcoming events */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Upcoming
        </p>
        <UpcomingEvents events={events ?? []} />
      </div>

      {/* Online members — only inside a group */}
      {groupId && members.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Members
          </p>
          <ul className="space-y-2">
            {members.map((m) => {
              const name = m.profiles?.full_name ?? "Unknown";
              return (
                <li key={m.user_id} className="flex items-center gap-2">
                  <Avatar name={name} size="xs" />
                  <span className="text-xs text-foreground flex-1 truncate">
                    {name}
                  </span>
                  {/* Presence is client-side; default offline here */}
                  <OnlineDot online={false} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
