import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { message: "Je moet ingelogd zijn om je account te verwijderen." },
      { status: 401 }
    )
  }

  try {
    const adminSupabase = createAdminClient()
    const operations = [
      () => adminSupabase.from("savings_rules").delete().eq("user_id", user.id),
      () => adminSupabase.from("transactions").delete().eq("user_id", user.id),
      () => adminSupabase.from("savings_jars").delete().eq("user_id", user.id),
      () => adminSupabase.from("accounts").delete().eq("user_id", user.id),
      () => adminSupabase.from("profiles").delete().eq("id", user.id),
    ]

    for (const operation of operations) {
      const { error } = await operation()

      if (error) {
        throw error
      }
    }

    const { error: deleteUserError } =
      await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      throw deleteUserError
    }

    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Account verwijderen is niet gelukt.",
      },
      { status: 500 }
    )
  }
}
