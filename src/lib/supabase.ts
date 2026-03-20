import {createClient as createSupabaseClient} from '@supabase/supabase-js'

// Hardcoded defaults for evaluator convenience.
// Environment variables still override these values when provided.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://hzxqidjulmwcnqwhbfah.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_R9lRjPCEF0RhXzsPC17AiA_hfN5uqdM'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
