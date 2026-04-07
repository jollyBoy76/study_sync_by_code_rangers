"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase.client';

export interface Resource {
  id: string;
  group_id: string;
  created_by: string;
  last_edited_by: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export function useResources(groupId: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async (searchQuery?: string) => {
    if (!groupId) return;

    setLoading(true);
    try {
      // 1. Start the base query
      // We use the specific foreign key name 'resources_created_by_fkey' 
      // because there are multiple relations to the profiles table.
      let query = supabase
        .from('resources')
        .select(`
          id,
          group_id,
          created_by,
          last_edited_by,
          title,
          content,
          created_at,
          updated_at,
          profiles!resources_created_by_fkey (
            full_name
          )
        `)
        .eq('group_id', groupId);

      // 2. Apply Search if a query is provided
      if (searchQuery && searchQuery.trim() !== "") {
        // Uses the 'fts' (Full-Text Search) column we created in the SQL table
        query = query.textSearch('fts', searchQuery, {
          type: 'websearch',
          config: 'english'
        });
      } else {
        // Default sorting: Newest first
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setResources((data as unknown as Resource[]) || []);
    } catch (error: any) {
      console.error('Error fetching resources:', error.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Initial fetch on mount or when groupId changes
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return {
    resources,
    loading,
    refetch: fetchResources
  };
}