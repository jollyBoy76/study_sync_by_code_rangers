"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinRequestsBadge } from "@/components/group/JoinRequestsBadge";
import { JoinRequestsModal } from "@/components/group/JoinRequestsModal";

interface GroupHeaderProps {
  groupId: string;
  createdBy: string;
  name: string;
  memberCount: number;
  lastActive?: string;
  onInvite?: () => void;
  onAddTask?: () => void;
}

export function GroupHeader({
  groupId,
  createdBy,
  name,
  memberCount,
  lastActive,
  onInvite,
  onAddTask,
}: GroupHeaderProps) {
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-medium text-foreground">{name}</h1>
            <JoinRequestsBadge
              groupId={groupId}
              createdBy={createdBy}
              onClick={() => setRequestsModalOpen(true)}
            />
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
            {lastActive && <span className="ml-1">· {lastActive}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onInvite && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInvite}
              className="h-7 text-xs px-3"
            >
              + Invite
            </Button>
          )}
          {onAddTask && (
            <Button
              size="sm"
              onClick={onAddTask}
              className="h-7 text-xs px-3"
            >
              + Add Task
            </Button>
          )}
        </div>
      </div>

      <JoinRequestsModal
        open={requestsModalOpen}
        onOpenChange={setRequestsModalOpen}
        groupId={groupId}
      />
    </>
  );
}