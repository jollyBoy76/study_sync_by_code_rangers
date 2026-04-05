"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  event_date: string;
  color: string;
}

interface CalendarGridProps {
  events: Event[];
  selectedDay: string | null;
  onDayClick: (date: string) => void;
}

export function CalendarGrid({ events, selectedDay, onDayClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate all days to display (including padding from prev/next months)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold tabular-nums">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names Row */}
      <div className="grid grid-cols-7 border-b pb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">
            {day}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-px bg-muted/20">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelected = selectedDay === dateStr;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayEvents = events.filter((e) => {
            // Use event_date as defined in your Database type
            const eventDatePart = e.event_date.split('T')[0]; 
            const calendarDatePart = format(day, "yyyy-MM-dd");
            return eventDatePart === calendarDatePart;
            });

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "relative h-20 sm:h-14 bg-background p-2 transition-colors hover:bg-accent/50 text-left flex flex-col items-start gap-1 group",
                !isCurrentMonth && "text-muted-foreground/30",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30"
              )}
            >
              {/* Day Number Styling */}
              <span className={cn(
                "flex h-6 w-6 items-center justify-center text-xs font-medium rounded-full transition-all",
                isToday(day) ? "bg-primary text-primary-foreground" : "group-hover:bg-muted",
                isSelected && !isToday(day) && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </span>

              {/* Event Dots Container */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}