// src/app/(app)/calendar/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useAllEvents } from "@/hooks/useAllEvents"; // Ensure this uses .order('event_date')
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayEventsPanel } from "@/components/calendar/DayEventsPanel";
import { AlertCircle } from "lucide-react";

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
      <div className="h-[600px] w-full rounded-xl bg-muted" />
    </div>
  )
}

export default function CalendarPage() {
  // 1. Fetch all events across all groups
  const { events, loading, error } = useAllEvents();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // 2. Memoize filtered events for performance
  // This ensures we don't re-filter every single time the component re-renders
  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => e.event_date === selectedDay);
  }, [selectedDay, events]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p>Failed to load calendar events.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Main Calendar Area ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            A consolidated view of all your study group schedules.
          </p>
        </div>

        {loading ? (
          <CalendarSkeleton />
        ) : (
          <div className="max-w-5xl">
            <CalendarGrid
              events={events}
              selectedDay={selectedDay}
              onDayClick={(date) =>
                setSelectedDay((prev) => (prev === date ? null : date))
              }
            />
          </div>
        )}
      </main>

      {/* ── Sidebar: Day Details ────────────────────────────────────────── */}
      <aside className="w-80 shrink-0 border-l border-border bg-card/30 backdrop-blur-sm">
        <DayEventsPanel 
          date={selectedDay} 
          events={dayEvents} 
        />
      </aside>
    </div>
  );
}