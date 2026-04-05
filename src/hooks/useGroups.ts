'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useUser } from './useUser'
import type { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']

export function useGroups() {
  const { user } = useUser()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  // Stable client instance — created once per hook mount, never recreated

  const fetchGroups = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('group_members')
      .select('groups (*)')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    setGroups((data || []).map((g: any) => g.groups))
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    setLoading(true)
    fetchGroups()

    // Random suffix ensures no two mounts ever share a channel name,
    // even under React StrictMode's double-invoke
    const channelName = `groups:${user.id}:${Math.random()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `user_id=eq.${user.id}`,
        },
        fetchGroups
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchGroups, supabase])

  return { groups, loading, refetch: fetchGroups }
}