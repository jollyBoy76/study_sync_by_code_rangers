"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  eventDays: Set<string>; // "YYYY-MM-DD"
}

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MiniCalendar({ eventDays }: MiniCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDow   = new Date(year, month, 1).getDay();       // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  // Build calendar grid (6 rows × 7 cols = 42 cells)
  type Cell = { day: number; curr: boolean };
  const cells: Cell[] = [];

  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: daysInPrev - firstDow + 1 + i, curr: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, curr: true });
  }
  while (cells.length < 42) {
    cells.push({ day: cells.length - firstDow - daysInMonth + 1, curr: false });
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-medium text-foreground">
          {viewDate.toLocaleString("default", { month: "long" })}
        </span>
        <button
          onClick={nextMonth}
          className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-muted-foreground py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          const iso = cell.curr ? isoDate(year, month, cell.day) : "";
          const isToday =
            cell.curr &&
            cell.day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const hasEvent = cell.curr && eventDays.has(iso);

          return (
            <div
              key={i}
              className={cn(
                "relative flex flex-col items-center justify-center text-[10px] py-0.5 rounded cursor-default",
                cell.curr
                  ? "text-foreground hover:bg-accent transition-colors"
                  : "text-muted-foreground/30",
                isToday && "bg-foreground text-background hover:bg-foreground/90 font-medium"
              )}
            >
              {cell.day}
              {hasEvent && !isToday && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
