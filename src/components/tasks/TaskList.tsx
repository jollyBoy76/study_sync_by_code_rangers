"use client";

import { useRef } from "react";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TaskStatus, TaskTag } from "@/types";

interface Assignee {
  user_id: string;
  full_name: string | null;
}

interface Task {
  id: string;
  title: string;
  tag: TaskTag;
  status: TaskStatus;
  progress: number;
  due_date?: string | null;
  assignees?: Assignee[];
}

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();

  const inProgress = tasks.filter((t) => t.status !== "done");
  const done       = tasks.filter((t) => t.status === "done");

  const supabase = useRef(createClient()).current;

  async function handleToggle(id: string, newStatus: TaskStatus, currentProgress: number) {
  const { error } = await supabase
    .from("tasks")
    .update({
      status:   newStatus,
      progress: newStatus === "done" ? 100 : currentProgress,
    })
      .eq("id", id);

    if (error) {
      toast.error("Could not update task");
    } else {
      router.refresh();
    }
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-8 h-8" />}
        title="No tasks yet"
        description="Add a task to get your group started."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {inProgress.length > 0 && (
        <section>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2 px-0.5">
            In Progress
          </p>
          <div className="flex flex-col gap-2">
            {inProgress.map((task) => (
              <TaskCard key={task.id} {...task} onToggle={handleToggle} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2 px-0.5">
            Completed
          </p>
          <div className="flex flex-col gap-2 opacity-70">
            {done.map((task) => (
              <TaskCard key={task.id} {...task} onToggle={handleToggle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
