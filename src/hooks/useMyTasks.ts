// src/hooks/useMyTasks.ts

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useUser } from './useUser'
import type { Database } from '@/types/database.types'

type Task = Database['public']['Views']['tasks_with_assignees']['Row']

export function useMyTasks() {
  const { user } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

  const fetchTasks = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('tasks_with_assignees')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setTasks(data || [])
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    setLoading(true)
    fetchTasks()

    const channel = supabase
      .channel(`my-tasks:${user.id}:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `created_by=eq.${user.id}`,
        },
        fetchTasks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchTasks, supabase])

  return { tasks, loading, refetch: fetchTasks }
}