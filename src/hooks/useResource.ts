"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase.client';
import { Resource } from './useResources'; // Reuse the interface if possible

export interface ResourceEditor {
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export function useResource(resourceId: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [editors, setEditors] = useState<ResourceEditor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResourceData = useCallback(async () => {
    if (!resourceId) return;

    setLoading(true);
    try {
      // 1. Fetch the Resource details + Creator Profile
      const resourcePromise = supabase
        .from('resources')
        .select(`
          *,
          profiles!resources_created_by_fkey (
            full_name
          )
        `)
        .eq('id', resourceId)
        .single();

      // 2. Fetch the Editors + Their Profiles
      const editorsPromise = supabase
        .from('resource_editors')
        .select(`
          user_id,
          profiles (
            full_name
          )
        `)
        .eq('resource_id', resourceId);

      // Run both in parallel for speed
      const [resResult, editResult] = await Promise.all([
        resourcePromise,
        editorsPromise
      ]);

      if (resResult.error) throw resResult.error;
      if (editResult.error) throw editResult.error;

      setResource(resResult.data as unknown as Resource);
      setEditors((editResult.data as unknown as ResourceEditor[]) || []);
      
    } catch (error: any) {
      console.error('Error fetching resource detail:', error.message);
      setResource(null);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    fetchResourceData();
  }, [fetchResourceData]);

  return {
    resource,
    editors,
    loading,
    refetch: fetchResourceData
  };
}