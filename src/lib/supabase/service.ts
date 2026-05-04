import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Bypasses RLS — server-side only, never expose to browser
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
