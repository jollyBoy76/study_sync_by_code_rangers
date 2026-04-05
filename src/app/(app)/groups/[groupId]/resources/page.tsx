// src/app/(app)/groups/[groupId]/resources/page.tsx

import { Construction } from 'lucide-react'

export default function GroupResourcesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center h-full">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Construction className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-base font-semibold">Resources coming soon</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          File sharing and notes for your group are currently being built.
          Check back soon.
        </p>
      </div>
    </div>
  )
}