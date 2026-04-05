"use client";

import { format, parseISO, isValid } from "date-fns";
import { Bell, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

interface DayEvent {
  id: string;
  title: string;
  color: string;
  description?: string | null;
}

interface DayEventsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  events: DayEvent[];
  onAddEvent: () => void;
}

export function DayEventsModal({
  open,
  onOpenChange,
  date,
  events,
  onAddEvent,
}: DayEventsModalProps) {
  const parsedDate = date ? parseISO(date) : null;
  const isDateValid = parsedDate && isValid(parsedDate);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isDateValid ? format(parsedDate, "eeee, MMMM d") : "Events"}
      description={
        events.length === 0
          ? "No events scheduled for this day."
          : `${events.length} event${events.length === 1 ? "" : "s"} scheduled`
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        {/* Event list */}
        {events.length > 0 ? (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium leading-snug">
                    {event.title}
                  </span>
                  {event.description && (
                    <span className="text-xs text-muted-foreground mt-0.5 truncate">
                      {event.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
              <Bell className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">No events on this day</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add one to get started.
            </p>
          </div>
        )}

        {/* Add event button */}
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              onOpenChange(false);
              onAddEvent();
            }}
          >
            <Plus className="h-4 w-4" />
            Add event
          </Button>
        </div>
      </div>
    </Modal>
  );
}
