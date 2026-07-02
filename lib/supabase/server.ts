import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export async function createClient() {
  const cookieStore = await cookies()
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot always write cookies. The proxy keeps
          // Supabase auth sessions fresh before rendering.
        }
      },
    },
  })
}
