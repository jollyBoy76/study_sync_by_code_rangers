"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// 1. Add CalendarDays to the lucide-react imports
import { LayoutDashboard, CheckSquare, User, Plus, CalendarDays } from "lucide-react"; 
import { SidebarGroupList } from "@/components/layout/SidebarGroupList";
import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { cn } from "@/lib/utils";

import { Search } from 'lucide-react'
import { GroupSearchModal } from '@/components/group/GroupSearchModal'

// 2. Add the Calendar object to the NAV_LINKS array
const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand Section */}
      <div className="flex h-14 items-center border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight text-primary">StudySync</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto py-6">
        {/* Main Navigation */}
        <div className="px-3">
          <ul className="space-y-1">
            {/* The .map function will now automatically include the Calendar link */}
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    pathname === href
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Groups Section */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-6">
            <Link
              href="/groups"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              Your Groups
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="Find a group"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="Create Group"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-2">
            <SidebarGroupList />
          </div>
        </section>
      </nav>

      {/* Footer / User Profile */}
      <div className="mt-auto border-t border-border p-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/profile"
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span>Profile Settings</span>
        </Link>
      </div>

      <CreateGroupModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <GroupSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </aside>
  );
}