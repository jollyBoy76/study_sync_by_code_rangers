"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";

const SUB_ROUTES = [
  { label: "Overview", href: "" },
  { label: "Tasks", href: "/tasks" },
  { label: "Calendar", href: "/calendar" },
  { label: "Resources", href: "/resources" },
] as const;

/**
 * HELPER COMPONENT: Renders an individual group row and its sub-menu
 */
function GroupItem({ group }: { group: { id: string; name: string } }) {
  const pathname = usePathname();
  const base = `/groups/${group.id}`;
  const isInGroup = pathname.startsWith(base);

  const [open, setOpen] = useState(isInGroup);

  // Auto-expand if the user navigates into this group via another link
  useEffect(() => {
    if (isInGroup) setOpen(true);
  }, [isInGroup]);

  return (
    <li>
      <div className="flex items-center gap-1">
        <Link
          href={base}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            isInGroup
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate text-left">{group.name}</span>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          className="rounded-md p-1 hover:bg-accent text-muted-foreground transition-colors"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          )}
        </button>
      </div>

      {open && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {SUB_ROUTES.map(({ label, href }) => {
            const fullHref = `${base}${href}`;
            // Active logic: Overview matches exactly, others match start
            const isActive = href === "" ? pathname === base : pathname === fullHref;
            
            return (
              <li key={label}>
                <Link
                  href={fullHref}
                  className={cn(
                    "block rounded-md px-2 py-1 text-xs transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

/** * MAIN EXPORT: This is what the Sidebar component imports
 */
export function SidebarGroupList() {
  // 1. Fix the destructuring: 
  // Your hook returns { groups, loading }, not { data, isLoading }
  const { groups, loading } = useGroups();

  if (loading) {
    return (
      <div className="space-y-2 px-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-md bg-muted/50"
          />
        ))}
      </div>
    );
  }

  // 2. Use 'groups' instead of 'data'
  if (!groups || groups.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground italic">No groups joined yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 px-2">
      {/* 3. Type the 'group' parameter to fix the 'any' error */}
      {groups.map((group: { id: string; name: string }) => (
        <GroupItem key={group.id} group={group} />
      ))}
    </ul>
  );
}