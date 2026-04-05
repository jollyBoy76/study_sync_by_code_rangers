// src/hooks/useEvents.ts

'use client'

import { useEffect, useState} from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import type { Database } from '@/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

export function useEvents(groupId: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('group_id', groupId)
      .order('event_date', { ascending: true });

    if (error) {
      console.error(error)
      return
    }

    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!groupId) return

    setLoading(true)
    fetchEvents()

    const channel = supabase
      .channel(`events-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])


  return { events, loading, refetch: fetchEvents }
}
