import { useState, useEffect, useRef } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useUser } from '@/hooks/useUser';

export interface GroupSearchResult {
  id: string;
  name: string;
  description: string;
  color: string;
  isMember: boolean;
  hasPendingRequest: boolean;
  memberCount: number;
}

export function useGroupSearch(query: string) {
  const [results, setResults] = useState<GroupSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useUser();

  useEffect(() => {
    const searchGroups = async () => {
      if (query.length < 2 || !user) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        // 1. Fetch matching groups and their member counts
        // Assumes a 'group_members' table exists for the count
        const { data: groups, error: groupError } = await supabase
          .from('groups')
          .select(`
            *,
            group_members(count)
          `)
          .ilike('name', `%${query}%`)
          .limit(10);

        if (groupError) throw groupError;

        // 2. Fetch User's current memberships
        const { data: memberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        // 3. Fetch User's pending join requests
        const { data: requests } = await supabase
          .from('join_requests')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('status', 'pending');

        // Map sets for O(1) lookup
        const membershipSet = new Set(memberships?.map(m => m.group_id));
        const requestSet = new Set(requests?.map(r => r.group_id));

        // 4. Combine data
        const formattedResults: GroupSearchResult[] = groups.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          color: g.color,
          isMember: membershipSet.has(g.id),
          hasPendingRequest: requestSet.has(g.id),
          memberCount: g.group_members?.[0]?.count ?? 0,
        }));

        setResults(formattedResults);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Simple debounce to prevent excessive API calls
    const handler = setTimeout(() => {
      searchGroups();
    }, 300);

    return () => clearTimeout(handler);
  }, [query, user, supabase]);

  return { results, loading };
}