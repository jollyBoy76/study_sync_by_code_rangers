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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Save, Trash2, Loader2, Users } from "lucide-react";
import { useResourceMutations } from "@/hooks/useResourceMutations";

// Define the types locally to solve the 'any' issue
interface ResourceEditor {
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface ResourceEditModalProps {
  resource: {
    id: string;
    group_id: string;
    title: string;
    content: string;
    created_by: string;
  };
  editors: ResourceEditor[];
  allMembers: { user_id: string; profiles: { full_name: string | null } }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
}

export function ResourceEditModal({
  resource,
  editors,
  allMembers,
  open,
  onOpenChange,
  onSaveSuccess,
}: ResourceEditModalProps) {
  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content);
  const { updateResource, addEditor, removeEditor, saving } = useResourceMutations(resource.group_id);

  // Filter: Don't show people who are already editors in the "Add" dropdown
  const availableToAssign = allMembers.filter(
    (m) => !editors.some((e: ResourceEditor) => e.user_id === m.user_id)
  );

  const handleSave = async () => {
    if (!title.trim()) return;
    const { success } = await updateResource(resource.id, title, content);
    if (success) {
      onSaveSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6">
          <DialogTitle>Edit Resource</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Title Section */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title..."
              />
            </div>

            {/* Markdown Editor Section */}
            <div className="space-y-2" data-color-mode="light">
              <Label>Content</Label>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={350}
                preview="edit" // Starts in edit mode for better focus
              />
            </div>

            <Separator />

            {/* Collaborator Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" />
                Manage Editors
              </div>

              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onChange={(e) => e.target.value && addEditor(resource.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Invite a member to edit...</option>
                  {availableToAssign.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profiles?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {editors.map((editor: ResourceEditor) => (
                  <div key={editor.user_id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20 text-sm">
                    <span className="truncate">{editor.profiles?.full_name}</span>
                    {/* Prevent removing the owner */}
                    {editor.user_id !== resource.created_by && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeEditor(resource.id, editor.user_id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}