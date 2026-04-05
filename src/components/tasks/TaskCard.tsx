"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { TaskProgressBar } from "./TaskProgressBar";
import { AssigneeAvatars } from "./AssigneeAvatars";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { TaskTag, TaskStatus } from "@/types";

interface Assignee {
  user_id: string;
  full_name: string | null;
}

interface TaskCardProps {
  id: string;
  title: string;
  tag: TaskTag;
  status: TaskStatus;
  progress: number;
  dueDate?: string | null;
  assignees?: Assignee[];
  onToggle?: (id: string, newStatus: TaskStatus, currentProgress: number) => void;
}

export function TaskCard({
  id,
  title,
  tag,
  status,
  progress,
  dueDate,
  assignees = [],
  onToggle,
}: TaskCardProps) {
  const [optimisticDone, setOptimisticDone] = useState(status === "done");

  function handleToggle() {
    const newStatus: TaskStatus = optimisticDone ? "in_progress" : "done";
    setOptimisticDone(!optimisticDone);
    onToggle?.(id, newStatus, progress);
  }

  const isDue = dueDate && !optimisticDone
    ? new Date(dueDate) < new Date()
    : false;

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-background
                    hover:border-border/80 transition-colors">
      {/* Top row */}
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          aria-label={optimisticDone ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 w-4 h-4 rounded flex-shrink-0 border transition-colors flex items-center justify-center",
            optimisticDone
              ? "bg-emerald-500 border-emerald-500"
              : "border-border hover:border-foreground/40"
          )}
        >
          {optimisticDone && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm leading-snug",
            optimisticDone
              ? "line-through text-muted-foreground"
              : "text-foreground"
          )}>
            {title}
          </p>

          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <Badge variant={tag} />
            {dueDate && (
              <span className={cn(
                "text-[10px]",
                isDue ? "text-destructive" : "text-muted-foreground"
              )}>
                Due {formatDate(dueDate)}
              </span>
            )}
            {assignees.length > 0 && (
              <div className="ml-auto">
                <AssigneeAvatars assignees={assignees} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar — only for non-done tasks */}
      {!optimisticDone && (
        <TaskProgressBar progress={progress} />
      )}
    </div>
  );
}
