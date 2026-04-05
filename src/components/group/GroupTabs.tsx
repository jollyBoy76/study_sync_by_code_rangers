"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface GroupTabsProps {
  groupId: string;
}

const TABS = [
  { label: "Overview",  path: ""          },
  { label: "Tasks",     path: "tasks"     },
  { label: "Resources", path: "resources" },
  { label: "Calendar",  path: "calendar"  },
  { label: "Members",   path: "members"   },
];

export function GroupTabs({ groupId }: GroupTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-border bg-background px-5">
      {TABS.map(({ label, path }) => {
        const href = `/groups/${groupId}${path ? `/${path}` : ''}`;
        const isActive = path === ''
          ? pathname === `/groups/${groupId}`
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={path}
            href={href}
            className={cn(
              "px-3 py-2.5 text-xs transition-colors border-b-2 -mb-px",
              isActive
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
