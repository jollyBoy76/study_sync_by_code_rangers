// src/app/(app)/groups/[groupId]/tasks/page.tsx
//
// Group-scoped tasks page — shows all tasks for a specific group.
// Includes AddTaskModal for creating new tasks within the group.

"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { TaskProgressBar } from "@/components/tasks/TaskProgressBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { use } from "react";

interface GroupTasksPageProps {
  params: Promise<{ groupId: string }>;
}

function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function GroupTasksPage({ params }: GroupTasksPageProps) {
  const { groupId } = use(params);
  const { tasks, loading } = useTasks(groupId);
  const [modalOpen, setModalOpen] = useState(false);

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${completed} of ${total} completed`}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {/* Overall group progress */}
      {!loading && total > 0 && (
        <TaskProgressBar progress={progress} />
      )}

      {/* Task list */}
      {loading ? (
        <TasksSkeleton />
      ) : (
        <TaskList tasks={tasks.filter((t) => t.id !== null) as any} />
      )}

      {/* Add task modal */}
      <AddTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        groupId={groupId}
      />

    </div>
  );
}