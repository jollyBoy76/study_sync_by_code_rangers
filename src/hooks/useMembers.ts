'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import type { Database } from '@/types/database.types'

export type Member = Database['public']['Tables']['group_members']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'] | null
  task_count: number
}

export function useMembers(groupId: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    if (!groupId) return

    try {
      // 1. Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)

      if (membersError) throw membersError

      // 2. Fetch profiles separately
      const userIds = membersData?.map((m) => m.user_id) ?? []

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      const profileMap = new Map(profilesData?.map((p) => [p.id, p]))

      // 3. Fetch task counts
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('created_by')
        .eq('group_id', groupId)

      const counts: Record<string, number> = {}
      tasksData?.forEach((t) => {
        if (t.created_by) {
          counts[t.created_by] = (counts[t.created_by] || 0) + 1
        }
      })

      // 4. Combine
      const formatted: Member[] = (membersData || []).map((m) => ({
        ...m,
        profile: profileMap.get(m.user_id) ?? null,
        task_count: counts[m.user_id] || 0,
      }))

      setMembers(formatted)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
  if (!groupId) return
  setLoading(true)
  fetchMembers()
}, [groupId, fetchMembers])
  return { members, loading, refetch: fetchMembers }
}