import { createClient } from '@/lib/supabase'

// Single shared instance for the entire app
export const supabaseClient = createClient()