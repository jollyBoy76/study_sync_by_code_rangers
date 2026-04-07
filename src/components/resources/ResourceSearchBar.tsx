"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResourceSearchBarProps {
  /** * Function to call when the search query changes. 
   * Passed the current string value.
   */
  onSearch: (query: string) => void;
}

export function ResourceSearchBar({ onSearch }: ResourceSearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    // 1. Set a timer to run after 300ms of no typing
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    // 2. CLEANUP: If the user types another letter before 300ms is up,
    // this 'return' function runs first and kills the previous timer.
    // This prevents 10 API calls if someone types a 10-letter word.
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search className="h-4 w-4" />
      </div>
      
      <Input
        placeholder="Search titles or content..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10 focus-visible:ring-primary"
      />

      {/* Show the 'X' clear button only when there is text */}
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent text-muted-foreground hover:text-foreground"
          onClick={() => setValue("")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}