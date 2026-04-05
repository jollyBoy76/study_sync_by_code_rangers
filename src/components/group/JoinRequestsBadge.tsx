"use client";

import { useUser } from "@/hooks/useUser";
import { useJoinRequests } from "@/hooks/useJoinRequests";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface JoinRequestsBadgeProps {
  groupId: string;
  createdBy: string; // Passed down from GroupHeader
  onClick: () => void;
  className?: string;
}

export function JoinRequestsBadge({ 
  groupId, 
  createdBy, 
  onClick, 
  className 
}: JoinRequestsBadgeProps) {
  const { user } = useUser();
  const { requests, loading } = useJoinRequests(groupId);

  // 1. Guard: Only the owner should ever see this badge
  const isOwner = createdBy === user?.id;
  
  // 2. Data check: Only show if there are actual pending requests
  const hasRequests = requests && requests.length > 0;

  // Don't render anything if user isn't owner, or we're loading, or no requests
  if (!isOwner || loading || !hasRequests) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 py-0 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-all animate-in fade-in zoom-in-95",
        className
      )}
    >
      <span className="relative flex h-2 w-2 mr-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
      </span>
      <span className="text-[11px] font-bold tracking-tight">
        {requests.length} {requests.length === 1 ? "Request" : "Requests"}
      </span>
    </Button>
  );
}