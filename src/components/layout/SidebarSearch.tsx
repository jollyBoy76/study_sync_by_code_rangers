"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SidebarSearch() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/groups")}
      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs
                 text-muted-foreground bg-muted/50 border border-border
                 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Search className="w-3 h-3 flex-shrink-0" />
      <span>Search groups…</span>
    </button>
  );
}
