"use client";

import { Loader2, Edit3, User, Calendar, ShieldCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResource } from "@/hooks/useResource";
import { useResourceMutations } from "@/hooks/useResourceMutations";

interface ResourceViewModalProps {
  resourceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditClick: () => void
  onDeleteSuccess: () => void  
  currentUserId: string
  groupCreatedBy: string       
}

interface ResourceEditor {
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export function ResourceViewModal({
  resourceId,
  open,
  onOpenChange,
  onEditClick,
  onDeleteSuccess,
  currentUserId,
  groupCreatedBy,
}: ResourceViewModalProps) {
  const { resource, editors, loading } = useResource(resourceId || "");
  const { deleteResource, saving } = useResourceMutations(resource?.group_id ?? "");

  async function handleDelete() {
    if (!window.confirm("Delete this resource? This cannot be undone.")) return;
    const { success } = await deleteResource(resource!.id);
    if (success) {
      onOpenChange(false);
      onDeleteSuccess();
    }
  }

  const isCreator = resource?.created_by === currentUserId;
  const isEditor = editors.some((e: ResourceEditor) => e.user_id === currentUserId);
  const canEdit = isCreator || isEditor;
  const isGroupOwner = groupCreatedBy === currentUserId;
  const canDelete = isCreator || isGroupOwner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden sm:rounded-xl gap-0">
        
        {/* Fixed Header Structure:
            1. pr-12 prevents content from overlapping the absolute-positioned 'X' button.
            2. DialogTitle is outside the conditional to fix the A11y error.
        */}
        <DialogHeader className="p-6 pb-4 pr-12 shrink-0"> 
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-bold leading-tight">
                {loading ? "Loading..." : resource?.title || "Resource View"}
              </DialogTitle>
              
              {!loading && resource && (
                <div className="flex items-center gap-2 shrink-0">
                  {canDelete && (
                    <Button
                      onClick={handleDelete}
                      disabled={saving}
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                  {canEdit && (
                    <Button onClick={onEditClick} size="sm" className="gap-2 shadow-sm">
                      <Edit3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {!loading && resource && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {resource.profiles?.full_name || "Unknown Author"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created {format(new Date(resource.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                
                {editors.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{editors.length} Collaborator{editors.length === 1 ? '' : 's'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <Separator /> 

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {loading && resourceId ? (
            <div className="flex h-full items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading resource...</p>
            </div>
          ) : !resource ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Resource could not be loaded.
            </div>
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none pb-8">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                  >
                    {resource?.content || ""}
                  </ReactMarkdown>
                </article>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}