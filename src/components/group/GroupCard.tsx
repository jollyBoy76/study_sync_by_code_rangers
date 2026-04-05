"use client";

import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Group } from "@/types";

interface GroupCardProps {
  group: Pick<Group, 'id' | 'name' | 'description' | 'color'> & Partial<Group>;
  className?: string; // Added to make the component more reusable
}

export function GroupCard({ group, className }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div 
        className={cn(
          "group relative flex h-40 flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md",
          className
        )}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full shrink-0" 
              style={{ backgroundColor: group.color }}
            />
            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
          </div>
          
          <p className={cn(
            "line-clamp-2 text-xs leading-relaxed",
            group.description ? "text-muted-foreground" : "text-muted-foreground/50 italic"
          )}>
            {group.description || "No description provided."}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>View Community</span>
          </div>
          
          <div className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}