"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_TAG_LIST } from "@/lib/constants";
import type { TaskTag } from "@/types";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function AddTaskModal({ open, onOpenChange, groupId }: AddTaskModalProps) {
  const router = useRouter();
  const [title, setTitle]     = useState("");
  const [tag, setTag]         = useState<TaskTag>("assignment");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Stable client — created once on mount, session cookies already attached 

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("tasks").insert({
        group_id:   groupId,
        created_by: user.id,
        title:      title.trim(),
        tag,
        due_date:   dueDate || null,
        status:     "in_progress",
        progress:   0,
      });

      if (error) throw error;

      toast.success("Task added!");
      onOpenChange(false);
      setTitle(""); setTag("assignment"); setDueDate("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add task"
      description="Create a new task for this group."
    >
      <div className="space-y-4 pt-1">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="task-title" className="text-xs">Title</Label>
          <Input
            id="task-title"
            placeholder="e.g. Implement AVL tree"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tag */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={tag} onValueChange={(v) => setTag(v as TaskTag)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TAG_LIST.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-sm">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="due-date" className="text-xs">Due date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || loading}>
            {loading ? "Adding…" : "Add task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
