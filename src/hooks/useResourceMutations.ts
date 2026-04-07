"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from "@/lib/supabase.client";

export function useResourceMutations(groupId: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // 1. Create a new resource
  const createResource = async (title: string, content: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: resource, error: resError } = await supabase
        .from("resources")
        .insert({
          group_id: groupId,
          created_by: user.id,
          title,
          content,
        })
        .select()
        .single();

      if (resError) throw resError;

      const { error: editError } = await supabase
        .from("resource_editors")
        .insert({
          resource_id: resource.id,
          user_id: user.id,
        });

      if (editError) throw editError;

      router.refresh();
      return { data: resource, error: null };
    } catch (error: any) {
      console.error("Error creating resource:", error.message);
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  };

  // 2. Update an existing resource
  const updateResource = async (resourceId: string, title: string, content: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("resources")
        .update({ 
          title, 
          content,
          last_edited_by: user?.id 
        })
        .eq("id", resourceId);

      if (error) throw error;

      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating resource:", error.message);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // 3. Delete a resource (The New Addition)
  const deleteResource = async (resourceId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;

      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error deleting resource:", error.message);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // 4. Add a collaborator/editor
  const addEditor = async (resourceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("resource_editors")
        .insert({ resource_id: resourceId, user_id: userId });

      if (error) throw error;

      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error adding editor:", error.message);
      return { success: false, error };
    }
  };

  // 5. Remove a collaborator/editor
  const removeEditor = async (resourceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("resource_editors")
        .delete()
        .eq("resource_id", resourceId)
        .eq("user_id", userId);

      if (error) throw error;

      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error removing editor:", error.message);
      return { success: false, error };
    }
  };

  return {
    createResource,
    updateResource,
    deleteResource, // <-- Now exported
    addEditor,
    removeEditor,
    saving,
  };
}