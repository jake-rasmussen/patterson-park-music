import { createClient as createClientPrimitive } from '@supabase/supabase-js'

export function createClient() {
  const supabase = createClientPrimitive(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
  )

  return supabase
}