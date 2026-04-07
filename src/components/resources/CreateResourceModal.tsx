"use client";

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { useResourceMutations } from "@/hooks/useResourceMutations";

interface CreateResourceModalProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // This will trigger the 'refetch' in your grid
}

export function CreateResourceModal({
  groupId,
  open,
  onOpenChange,
  onSuccess,
}: CreateResourceModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { createResource, saving } = useResourceMutations(groupId);

  const handleCreate = async () => {
    if (!title.trim()) return;

    const { error } = await createResource(title, content);
    
    if (!error) {
      // Reset local state for the next time it opens
      setTitle("");
      setContent("");
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 flex flex-row items-center justify-between border-b">
          <DialogTitle>Create New Resource</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Using a standard div with overflow instead of ScrollArea as per your setup */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-resource-title" className="text-sm font-bold">
              Resource Title
            </Label>
            <Input
              id="new-resource-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Data Structures - Week 10 Notes"
              className="text-lg focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2" data-color-mode="light">
            <Label className="text-sm font-bold">Content (Markdown)</Label>
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={400}
              preview="edit"
              className="border rounded-md overflow-hidden"
            />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-1">
              Supports GitHub Flavored Markdown
            </p>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border" />

        <DialogFooter className="p-6 bg-muted/10 flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={saving || !title.trim()} 
            className="gap-2 min-w-[140px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {saving ? "Creating..." : "Create Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}