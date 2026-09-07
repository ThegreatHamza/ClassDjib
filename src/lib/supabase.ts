import { createClient } from '@supabase/supabase-js'

// The publishable key is safe for browser use; RLS protects database access.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://neexmhqiungzvbszbzgr.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_glURdB0Wpo5HQv3Xaom04A_7ikjS4Tg'

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
