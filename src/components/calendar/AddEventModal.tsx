"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { Modal } from "@/components/ui/Modal"; // Adjust path based on your wrapper
import { toast } from "sonner"; // Assuming you are using sonner or similar for toasts
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  defaultDate?: string;
}

// Same color palette pattern used in CreateGroupModal
const EVENT_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#6366f1", // Indigo
  "#d946ef", // Fuchsia
  "#8b5cf6", // Violet
];

export function AddEventModal({
  open,
  onOpenChange,
  groupId,
  defaultDate,
}: AddEventModalProps) {
  const router = useRouter(); 

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[4]); // Default to Sky blue
  const [isLoading, setIsLoading] = useState(false);

  // Sync defaultDate when the modal opens
  useEffect(() => {
    if (open) {
      setEventDate(defaultDate || "");
      setTitle("");
      setDescription("");
      setColor(EVENT_COLORS[4]);
    }
  }, [open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      toast.error("Please fill in the title and date.");
      return;
    }

    setIsLoading(true);

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Could not verify user");

      // Insert into the database
      const { error: insertError } = await supabase.from("events").insert({
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        color: color,
        group_id: groupId,
        created_by: user.id,
      });

      if (insertError) throw insertError;

      // Success sequence
      toast.success("Event added successfully!");
      onOpenChange(false);
      router.refresh();
      
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error(error.message || "Failed to add event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Event"
      description="Create an event for your study group's calendar."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium">
            Event Title
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g., Midterm Study Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Date Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="eventDate" className="text-sm font-medium">
            Date
          </label>
          <input
            id="eventDate"
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Color Picker (Dots) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Event Color</label>
          <div className="flex flex-wrap gap-3">
            {EVENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-8 w-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  color === c ? "ring-2 ring-ring ring-offset-2 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Add any extra details, zoom links, or room numbers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}