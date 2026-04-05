// src/app/(app)/groups/[groupId]/members/page.tsx

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase.server'
import { MemberList } from '@/components/group/MemberList'

interface GroupMembersPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupMembersPage({ params }: GroupMembersPageProps) {
  const { groupId } = await params
  const supabase = await createClient()

  const { data: group } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (!group) notFound()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage who's in this group
        </p>
      </div>

      <MemberList groupId={groupId} createdBy={group.created_by} />
    </div>
  )
}