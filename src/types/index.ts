// src/types/index.ts
import type { Database } from './database.types'

/**
 * GENERIC HELPERS
 * These utilities allow us to extract types directly from the 
 * auto-generated Supabase schema.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

/**
 * ENUMS
 * Extracted from the 'public' schema enums.
 */
export type MemberRole = Enums<'member_role'>
export type TaskStatus = Enums<'task_status'>
export type TaskTag = Enums<'task_tag'>

/**
 * TABLES (Domain Models)
 * These represent the rows for each table in your database.
 */
export type Event = Tables<'events'>
export type GroupMember = Tables<'group_members'>
export type Group = Tables<'groups'>
export type Profile = Tables<'profiles'>
export type Resource = Tables<'resources'>
export type Task = Tables<'tasks'>

/**
 * VIEWS
 * These represent the results of database views.
 */
export type TaskWithAssignees = Database['public']['Views']['tasks_with_assignees']['Row']

/**
 * RELATIONSHIP TYPES (Custom Extensions)
 * In a real application, you often fetch data with its relations. 
 * You can define those combined types here.
 */

// Example: A task including the profile data of the person it's assigned to
export interface TaskWithProfile extends Task {
  assignee?: Profile | null
}

// Example: A group including its list of members
export interface GroupWithMembers extends Group {
  members?: GroupMember[]
}