// src/app/(app)/groups/[groupId]/resources/page.tsx

"use client";

import { use, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { useResources } from "@/hooks/useResources";
import { useResource } from "@/hooks/useResource";
import { useMembers } from "@/hooks/useMembers";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceSearchBar } from "@/components/resources/ResourceSearchBar";
import { ResourceViewModal } from "@/components/resources/ResourceViewModal";
import { ResourceEditModal } from "@/components/resources/ResourceEditModal";
import { CreateResourceModal } from "@/components/resources/CreateResourceModal";
import { Button } from "@/components/ui/button";   
import { Plus, FileText, Info } from "lucide-react";

interface GroupResourcesPageProps {
  params: Promise<{ groupId: string }>;
}

function ResourcesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function GroupResourcesPage({ params }: GroupResourcesPageProps) {
  const { groupId } = use(params);
  const { user } = useUser();

  const { resources, loading, refetch } = useResources(groupId);
  const { members } = useMembers(groupId);
  const [groupCreatedBy, setGroupCreatedBy] = useState("")
  
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const [viewOpen, setViewOpen]                     = useState(false)
  const [editOpen, setEditOpen]                     = useState(false)
  const [createOpen, setCreateOpen]                 = useState(false)

  // Fetch full resource data for edit modal
  const { resource: selectedResource, editors } = useResource(selectedResourceId || "")

  function handleCardClick(resourceId: string) {
    setSelectedResourceId(resourceId)
    setViewOpen(true)
  }

  function handleEditClick() {
    setViewOpen(false)
    setEditOpen(true)
  }

  function handleEditClose() {
    setEditOpen(false)
    setViewOpen(true) // go back to view after editing
  }

  const handleSearch = useCallback((query: string) => {
    refetch(query)
  }, [refetch])

  // Map members to the shape ResourceEditModal expects
  const membersForEditor = members.map((m) => ({
    user_id: m.user_id,
    profiles: { full_name: m.profile?.full_name ?? null },
  }))

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Resources</h2>
            {/* Info tooltip */}
            <div className="group relative">
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block
                              w-56 rounded-lg border border-border bg-popover p-2.5 text-xs text-muted-foreground
                              shadow-md z-10">
                Markdown files shared by group members. Click any card to read,
                edit if you have permission.
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${resources.length} resource${resources.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ResourceSearchBar onSearch={handleSearch} />
          <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New resource
          </Button>
        </div>
      </div>

      {/* ── Resource grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <ResourcesSkeleton />
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No resources yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create the first resource for your group
          </p>
          <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New resource
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => handleCardClick(resource.id)}
            />
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <ResourceViewModal
        resourceId={selectedResourceId}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEditClick={handleEditClick}
        onDeleteSuccess={() => refetch()}  // ← add
        currentUserId={user?.id ?? ""}
        groupCreatedBy={groupCreatedBy}    // ← add
      />

      {selectedResource && (
        <ResourceEditModal
          resource={selectedResource}
          editors={editors}
          allMembers={membersForEditor}
          open={editOpen}
          onOpenChange={(open) => {
            if (!open) handleEditClose()
            else setEditOpen(true)
          }}
          onSaveSuccess={() => {
            refetch()
            handleEditClose()
          }}
        />
      )}

      <CreateResourceModal
        groupId={groupId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch()}
      />

    </div>
  )
}