"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Adjust path to your Modal/Dialog
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import { useGroupSearch } from "@/hooks/useGroupSearch";
import { useUser } from "@/hooks/useUser";
import { supabaseClient as supabase } from '@/lib/supabase.client'

interface GroupSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupSearchModal({ open, onOpenChange }: GroupSearchModalProps) {
  const [query, setQuery] = useState("");
  const { results, loading } = useGroupSearch(query);
  const { user } = useUser(); 

  // Track requests made in this session for instant UI feedback
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleRequestJoin = async (groupId: string) => {
    if (!user) return;
    
    setIsSubmitting(groupId);

    const { error } = await supabase
      .from("join_requests")
      .insert({ group_id: groupId, user_id: user.id });

    if (!error) {
      // Optimistically update the UI so the button changes to "Pending" instantly
      setLocalPending((prev) => new Set(prev).add(groupId));
    } else {
      console.error("Failed to send join request:", error);
      // Optional: Add a toast notification here if you use something like sonner/react-hot-toast
    }

    setIsSubmitting(null);
  };

  // Reset state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery("");
        setLocalPending(new Set());
      }, 200); // Clear state after exit animation
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden outline-none">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">Join a Group</DialogTitle>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/30"
              autoFocus
            />
          </div>

          {/* Results Area */}
          <div className="flex flex-col min-h-[240px] max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            
            {/* Loading Skeleton */}
            {loading && query.length >= 2 && (
              <div className="flex flex-col gap-3 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State / Prompt */}
            {!loading && query.length < 2 && (
              <div className="flex flex-1 items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search.
                </p>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  No groups found matching "{query}".
                </p>
              </div>
            )}

            {/* Actual Results */}
            {!loading && results.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {results.map((group) => {
                  const isPending = group.hasPendingRequest || localPending.has(group.id);
                  const isMember = group.isMember;

                  return (
                    <div 
                      key={group.id} 
                      className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-muted/10 transition-colors"
                    >
                      {/* Group Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: group.color || "#888" }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {group.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isMember ? (
                        <Button variant="secondary" size="sm" disabled className="shrink-0 opacity-70">
                          Joined
                        </Button>
                      ) : isPending ? (
                        <Button variant="outline" size="sm" disabled className="shrink-0 opacity-70">
                          Pending
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestJoin(group.id)}
                          disabled={isSubmitting === group.id}
                          className="shrink-0"
                        >
                          Request to join
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}