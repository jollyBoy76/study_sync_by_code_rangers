'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useUser } from './useUser'

export interface CalendarEvent {
  id: string
  title: string
  event_date: string
  color: string
  group_id: string
  group_name: string | null // Explicitly allow null to match DB and component
}

export function useAllEvents() {
  const { user } = useUser()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  // 1. Added error state
  const [error, setError] = useState<Error | null>(null)
  

  const fetchEvents = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            events (
              id,
              title,
              event_date,
              color,
              group_id
            )
          )
        `)
        .eq('user_id', user.id)

      if (supabaseError) throw supabaseError

      const flat: CalendarEvent[] = []
      for (const member of data ?? []) {
        const group = (member as any).groups
        if (!group) continue
        
        const groupEvents = Array.isArray(group.events) ? group.events : []
        
        for (const event of groupEvents) {
          flat.push({
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            color: event.color,
            group_id: event.group_id,
            group_name: group.name ?? null,
          })
        }
      }

      // Sort by date ascending (ISO strings compare correctly with localeCompare)
      flat.sort((a, b) => a.event_date.localeCompare(b.event_date))

      setEvents(flat)
    } catch (err: any) {
      console.error('Error fetching all events:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch events'))
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    fetchEvents()

    const channel = supabase
      .channel(`all-events:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        fetchEvents
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchEvents, supabase])

  // 2. Return the error state so the Page can use it
  return { events, loading, error, refetch: fetchEvents }
}