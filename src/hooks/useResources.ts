// src/hooks/useResources.ts

'use client'

import { useEffect, useState } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import type { Database } from '@/types/database.types'

type Resource = Database['public']['Tables']['resources']['Row']

export function useResources(groupId: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setResources(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!groupId) return

    setLoading(true)
    fetchResources()

    const channel = supabase
      .channel(`resources-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchResources()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])

  return { resources, loading, refetch: fetchResources }
}