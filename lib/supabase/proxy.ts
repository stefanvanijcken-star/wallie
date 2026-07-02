import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, options, value }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
