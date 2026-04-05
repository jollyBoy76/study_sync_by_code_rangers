"use client";

import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useJoinRequests } from "@/hooks/useJoinRequests";

interface JoinRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function JoinRequestsModal({ open, onOpenChange, groupId }: JoinRequestsModalProps) {
  const { requests, loading } = useJoinRequests(groupId);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from("join_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Requests</DialogTitle>
          <DialogDescription>
            Review users who have requested to join this group.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-[200px] max-h-[400px] overflow-y-auto pr-2 mt-2 space-y-3 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl bg-muted/10">
              <p className="text-sm font-medium text-foreground">No pending requests</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            requests.map((request) => {
              const fullName = request.profiles?.full_name || "Unknown User";
              const isProcessing = processingId === request.id;

              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar 
                      name={fullName} 
                      size="md" 
                    />
                    <span className="text-sm font-medium truncate">
                      {fullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(request.id, 'approved')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}