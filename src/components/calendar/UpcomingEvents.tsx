import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  event_date: string;
  color: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">No upcoming events.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-2">
          <span
            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: event.color }}
          />
          <div>
            <p className="text-[11px] font-medium text-foreground leading-snug">
              {event.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDate(event.event_date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
