"use client";

import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, isToday, isTomorrow, startOfDay } from "date-fns";

interface Task {
  id: string;
  title: string;
  due_date: string;
  tag: string;
  status: string;
}

interface DueSoonListProps {
  tasks: Task[];
}

export function DueSoonList({ tasks }: DueSoonListProps) {
  // 1. Filter out tasks where status is "done" and ensure they have a due date
  const upcomingTasks = tasks
    .filter((task) => task.status !== "done" && task.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  // 2. Relative date logic
  const getRelativeDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = startOfDay(new Date());

    if (isPast(date) && !isToday(date)) {
      return { label: "Overdue", isOverdue: true };
    }
    if (isToday(date)) {
      return { label: "Today", isOverdue: false };
    }
    if (isTomorrow(date)) {
      return { label: "Tomorrow", isOverdue: false };
    }
    
    return { 
      label: `In ${formatDistanceToNow(date)}`, 
      isOverdue: false 
    };
  };

  if (upcomingTasks.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5">
        <p className="text-sm text-muted-foreground">No upcoming deadlines 🎉</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border bg-card shadow-sm">
      {upcomingTasks.map((task) => {
        const { label, isOverdue } = getRelativeDateLabel(task.due_date);
        
        // Match tag to BadgeVariant
        const variant = (task.tag?.toLowerCase() as BadgeVariant) || "other";

        return (
          <div 
            key={task.id} 
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Badge using the 'label' prop as required by your component */}
              <Badge 
                variant={variant} 
                label={task.tag.replace('_', ' ')}
                className="shrink-0 uppercase text-[10px] tracking-wider"
              />
              
              <span className="truncate text-sm font-medium text-foreground">
                {task.title}
              </span>
            </div>

            <span 
              className={cn(
                "ml-4 shrink-0 text-xs font-semibold",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}