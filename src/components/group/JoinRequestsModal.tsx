"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  onSuccess?: () => void;
}

export function JoinRequestsModal({ open, onOpenChange, groupId, onSuccess }: JoinRequestsModalProps) {
  const router = useRouter();
  const { requests, loading, refetch } = useJoinRequests(groupId);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    setFeedback(null); 

    try {
      const { error } = await supabase
        .from("join_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      // 3. SET FEEDBACK MESSAGE
      setFeedback({ 
        msg: `Request ${status === 'approved' ? 'accepted' : 'rejected'}!`, 
        type: 'success' 
      });

      // 4. REFRESH LOCAL LIST (Modal stays open, list updates)
      await refetch();
      
      // 5. REFRESH THE SERVER PAGE (The "1" badge in the background updates)
      router.refresh(); 

      setTimeout(() => setFeedback(null), 2000);;

    } catch (error: any) {
      console.error(`Failed to ${status} request:`, error.message);
      setFeedback({ msg: "Failed to update request", type: 'error' });
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

        {/* --- GREEN/RED FEEDBACK BOX --- */}
        {feedback && (
          <div className={`p-3 rounded-lg border text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {feedback.msg}
            </div>
          </div>
        )}

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
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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