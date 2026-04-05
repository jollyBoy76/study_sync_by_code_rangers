// src/app/(app)/tasks/page.tsx
//
// Global tasks view — shows all tasks created by the current user
// across every group they belong to.

"use client";

import { useState } from "react";
import { useMyTasks } from "@/hooks/useMyTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { Skeleton } from "@/components/ui/skeleton";

function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function TasksPage() {
  const { tasks, loading } = useMyTasks();

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold">My Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : `${completed} of ${total} completed`}
        </p>
      </div>

      {/* Task list */}
      {loading ? <TasksSkeleton /> : <TaskList tasks={tasks.filter((t) => t.id !== null) as any} />}

    </div>
  );
}