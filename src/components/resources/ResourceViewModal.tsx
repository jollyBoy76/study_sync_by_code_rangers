"use client";

import { Loader2, Edit3, User, Calendar, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // Allows HTML rendering (like specific image sizes)

import {Dialog, DialogContent, DialogHeader,DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResource } from "@/hooks/useResource";


interface ResourceViewModalProps {
  resourceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditClick: () => void
  onDeleteSuccess: () => void  // ← add this
  currentUserId: string
  groupCreatedBy: string       // ← add this
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
  currentUserId,
}: ResourceViewModalProps) {
  // If resourceId is null, our hook should safely return null/loading
  const { resource, editors, loading } = useResource(resourceId || "");

  // Permission Checks: Safe optional chaining in case resource is still loading
    const isCreator = resource?.created_by === currentUserId;
    const isEditor = editors.some((e: ResourceEditor) => e.user_id === currentUserId);
    const canEdit = isCreator || isEditor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-xl gap-0">
        
        {/* State 1: Loading */}
        {loading && resourceId ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading resource...</p>
          </div>
        ) : !resource ? (
          
          /* State 2: Not Found / Error */
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Resource could not be loaded.
          </div>
        ) : (
          
          /* State 3: Success */
          <>
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {resource.title}
                </DialogTitle>
                
                {/* Only show edit button if they have permission */}
                {canEdit && (
                  <Button 
                    onClick={onEditClick} 
                    size="sm" 
                    className="gap-2 shrink-0 shadow-sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Metadata Row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
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
            </DialogHeader>

            <Separator />

            {/* Markdown Content Area */}
            <ScrollArea className="flex-1 p-6">
              {/* Note: The 'prose' class requires @tailwindcss/typography */}
              <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none pb-8">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                >
                  {resource.content}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}