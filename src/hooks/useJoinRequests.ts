import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase.client'

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

export function useJoinRequests(groupId: string) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
  if (!groupId) return

  setLoading(true)

  const { data, error } = await supabase
    .from('join_requests')
    .select(`*, profiles(full_name)`)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching join requests:', error.message)
    setRequests([])
    setLoading(false)
    return
  }

  setRequests((data as unknown as JoinRequest[]) ?? [])
  setLoading(false)
}, [groupId, supabase])

  useEffect(() => {
    fetchRequests();

    // Set up Realtime subscription
    const channel = supabase
      .channel(`join_requests:${groupId}:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'join_requests',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          // Refresh the list whenever a change occurs
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchRequests, supabase]);

  return { 
    requests, 
    loading, 
    refetch: fetchRequests 
  };
}