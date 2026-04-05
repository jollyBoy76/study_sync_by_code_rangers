"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GROUP_COLORS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateGroupModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateGroupModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateGroupModalProps) {
  const router = useRouter();
 
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = setControlledOpen ?? setInternalOpen;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  type ColorHex = (typeof GROUP_COLORS)[number]["hex"];
  const [color, setColor] = useState<ColorHex>(GROUP_COLORS[0].hex);

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);

    try {
      
      // 1. Use getSession() instead of getUser() for more reliable 
      // auth context in client-side inserts.
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error("You must be logged in to create a group.");
      }

      const userId = session.user.id;

      // 2. Perform the insert
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ 
          name: name.trim(), 
          description: description.trim() || null, 
          color, 
          created_by: userId // The foreign key must match session.user.id
        })
        .select()
        .single();

      if (groupError) {
        // If it still fails here, the issue is in the Supabase Database Schema
        console.error("Group Insert Error:", groupError);
        throw groupError;
      }

      // 3. Add membership
      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: userId,
        role: "owner",
      });

      if (memberError) throw memberError;

      toast.success(`Group "${group.name}" created!`);
      
      onOpenChange(false);
      setName(""); 
      setDescription(""); 
      setColor(GROUP_COLORS[0].hex);
      
      router.refresh();
      router.push(`/groups/${group.id}/tasks`);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {controlledOpen === undefined && (
        <Button onClick={() => setInternalOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Group</span>
        </Button>
      )}

      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Create a study group"
        description="Give your group a name and pick a colour."
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="group-name" className="text-xs">
              Group name
            </Label>
            <Input
              id="group-name"
              placeholder="e.g. Data Structures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-desc" className="text-xs">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="group-desc"
              placeholder="What is this group studying?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    color === c.hex
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!name.trim() || loading}
            >
              {loading ? "Creating…" : "Create group"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}