import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { createClient } from "@/lib/supabase/server"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      {children}
    </main>
  )
}
