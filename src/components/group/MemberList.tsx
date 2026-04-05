"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useMembers } from "@/hooks/useMembers";
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge"; // Updated import
import { Trash2, LogOut, Loader2, ShieldCheck, User } from "lucide-react";

interface MemberListProps {
  groupId: string;
  createdBy: string;
}

export function MemberList({ groupId, createdBy }: MemberListProps) {
  const { user } = useUser();
  const { members, loading } = useMembers(groupId);
  const router = useRouter();
  
  const [isActioning, setIsActioning] = useState<string | null>(null);

  const isOwner = user?.id === createdBy;

  const handleRemoveMember = async (userId: string, isSelf: boolean) => {
    const confirmMsg = isSelf 
      ? "Are you sure you want to leave this group?" 
      : "Remove this member from the group?";

    if (!window.confirm(confirmMsg)) return;

    setIsActioning(userId);

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) throw error;

      if (isSelf) {
        router.push("/groups");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error modifying membership:", error);
    } finally {
      setIsActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm tracking-tight">Group Members ({members.length})</h3>
      </div>
      
      <div className="divide-y">
        {members.map((member) => {
          const isMemberOwner = member.user_id === createdBy;
          const isCurrentUser = member.user_id === user?.id;
          const processing = isActioning === member.user_id;

          return (
            <div key={member.user_id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar name={member.profile?.full_name ?? 'Unknown'} size="md" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{member.profile?.full_name ?? 'Unknown'}</span>
                    
                    {/* Integrated with your new Badge component */}
                    {isMemberOwner ? (
                      <Badge 
                        variant="other" 
                        label="Owner"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 gap-1"
                      />
                    ) : (
                      <Badge 
                        variant="other" 
                        label="Member"
                        className="gap-1"
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.task_count || 0} active tasks
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && !isMemberOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(member.user_id, false)}
                    disabled={!!isActioning}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                )}

                {!isOwner && isCurrentUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveMember(member.user_id, true)}
                    disabled={!!isActioning}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                    Leave Group
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}