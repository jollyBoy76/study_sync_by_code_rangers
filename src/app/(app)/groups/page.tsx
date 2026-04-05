// src/app/(app)/groups/page.tsx

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/group/GroupCard";
import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { GroupSearchModal } from "@/components/group/GroupSearchModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGroups } from "@/hooks/useGroups";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GroupsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const { groups, loading } = useGroups();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Groups</h1>
          <p className="text-sm text-muted-foreground">
            Study groups you belong to
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setSearchModalOpen(true)}
          >
            <Search className="h-4 w-4" />
            Find a group
          </Button>
          <CreateGroupModal />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <GroupsGridSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create a group or ask someone to invite you."
          action={<CreateGroupModal />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Modals */}
      <GroupSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />

    </div>
  );
}