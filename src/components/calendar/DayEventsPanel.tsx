"use client";

import { format, parseISO, isValid } from "date-fns";
import { Bell, CalendarIcon } from "lucide-react";

interface DayEvent {
  id: string;
  title: string;
  color: string;
  group_name?: string | null;
}

interface DayEventsPanelProps {
  date: string | null;
  events: DayEvent[];
}

export function DayEventsPanel({ date, events }: DayEventsPanelProps) {
  const parsedDate = date ? parseISO(date) : null;
  const isDateValid = parsedDate && isValid(parsedDate);

  return (
    <div className="flex h-full flex-col gap-6 p-6 border-l bg-background">
      {/* Header Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <CalendarIcon className="h-4 w-4" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {isDateValid ? format(parsedDate, "eeee, MMMM d") : "Select a day"}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          {events.length} {events.length === 1 ? "event" : "events"} scheduled
        </p>
      </div>

      {/* Events List Section */}
      <div className="flex-1 overflow-y-auto">
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="group flex items-center gap-4 rounded-lg border border-transparent bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50"
              >
                <div 
                  className="h-2 w-2 shrink-0 rounded-full shadow-sm" 
                  style={{ backgroundColor: event.color }} 
                />
                
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate leading-none mb-1">
                    {event.title}
                  </span>
                  {event.group_name && (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {event.group_name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
              <Bell className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <h4 className="text-sm font-medium">No events on this day</h4>
            <p className="text-xs text-muted-foreground mt-1">
              No events scheduled for this day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}