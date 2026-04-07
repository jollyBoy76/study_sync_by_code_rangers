"use client";

import { FileText, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import removeMd from "remove-markdown";
import { Resource } from "@/hooks/useResources"; // Import the interface we made earlier

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  // 1. Clean up the Markdown for the preview text
  // We strip the syntax, then trim it to 120 characters
  const plainText = removeMd(resource.content);
  const previewText = plainText.length > 120 
    ? plainText.substring(0, 120) + "..." 
    : plainText || "No additional content.";

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.98]"
    >
      {/* Icon and Header */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      {/* Title and Snippet */}
      <div className="space-y-2">
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {resource.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
          {previewText}
        </p>
      </div>

      {/* Metadata Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-primary" />
          <span className="truncate max-w-[100px]">
            {resource.profiles?.full_name || "Unknown User"}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(resource.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}