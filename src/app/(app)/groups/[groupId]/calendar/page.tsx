// src/app/(app)/groups/[groupId]/calendar/page.tsx
//
// Group-scoped calendar — shows events for this group only.
// Clicking a day opens a modal with that day's events + an "Add event" button.

"use client";

import { useState, use } from "react";
import { useEvents } from "@/hooks/useEvents";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayEventsModal } from "@/components/calendar/DayEventsModal";
import { AddEventModal } from "@/components/calendar/AddEventModal";

interface GroupCalendarPageProps {
  params: Promise<{ groupId: string }>;
}

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
      <div className="h-[520px] rounded-xl bg-muted animate-pulse" />
    </div>
  );
}

export default function GroupCalendarPage({ params }: GroupCalendarPageProps) {
  const { groupId } = use(params);
  const { events, loading } = useEvents(groupId);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  function handleDayClick(date: string) {
    setSelectedDay(date);
    setDayModalOpen(true);
  }

  // Events for the selected day
  const dayEvents = selectedDay
    ? events.filter((e) => e.event_date === selectedDay)
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Calendar</h2>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${events.length} event${events.length === 1 ? "" : "s"} this group`}
        </p>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <CalendarSkeleton />
      ) : (
        <div className="w-full rounded-xl border bg-card shadow-sm h-auto">
          <CalendarGrid
            events={events}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />
        </div>
      )}

      {/* Day events modal — opens when a day is clicked */}
      <DayEventsModal
        open={dayModalOpen}
        onOpenChange={setDayModalOpen}
        date={selectedDay}
        events={dayEvents}
        onAddEvent={() => setAddModalOpen(true)}
      />

      {/* Add event modal — opens from the day modal's "Add event" button */}
      <AddEventModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        groupId={groupId}
        defaultDate={selectedDay ?? undefined}
      />

    </div>
  );
}