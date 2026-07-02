"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { createClient } from "@/lib/supabase/client"

type SignOutButtonProps = {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message)
      setIsSigningOut(false)
      return
    }

    toast.success("Je bent uitgelogd")
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button
      className={className}
      disabled={isSigningOut}
      onClick={handleSignOut}
      type="button"
      variant="outline"
    >
      {isSigningOut ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        <LogOut data-icon="inline-start" />
      )}
      Uitloggen
    </Button>
  )
}
