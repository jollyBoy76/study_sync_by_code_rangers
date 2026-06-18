// src/hooks/useTasks.ts

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import type { Database } from '@/types/database.types'

type Task = Database['public']['Views']['tasks_with_assignees']['Row']

export function useTasks(groupId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks_with_assignees')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

// ✅ NEW CODE (shows the real problem)
if (error) {
  console.error("SUPABASE ERROR DETAILS:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
}

    setTasks(data || [])
    setLoading(false)
  }, [groupId, supabase])

  useEffect(() => {
    if (!groupId) return

    setLoading(true)
    fetchTasks()

    const channel = supabase
      .channel(`tasks:${groupId}:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `group_id=eq.${groupId}`,
        },
        fetchTasks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, fetchTasks, supabase])

  return { tasks, loading, refetch: fetchTasks }
}