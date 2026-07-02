"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { clearDashboardState } from "@/features/dashboard/dashboard-storage"

type DeleteAccountButtonProps = {
  className?: string
  disabled?: boolean
  onDeleted?: () => void
}

export function DeleteAccountButton({
  className,
  disabled,
  onDeleted,
}: DeleteAccountButtonProps) {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAccount() {
    if (isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string
        } | null

        throw new Error(body?.message ?? "Account verwijderen is niet gelukt.")
      }

      clearDashboardState()
      toast.success("Je account is verwijderd")
      setIsConfirmOpen(false)
      onDeleted?.()
      router.replace("/login")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Account verwijderen is niet gelukt."
      )
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        className={className}
        disabled={disabled || isDeleting}
        onClick={() => setIsConfirmOpen(true)}
        type="button"
        variant="destructive"
      >
        {isDeleting ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        Account verwijderen
      </Button>

      <AlertDialog
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsConfirmOpen(open)
          }
        }}
        open={isConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je het zeker? Je Wallie-account, login, rekeningen,
              spaarpotten, automatiseringen en activiteit worden permanent
              verwijderd. Dit kan niet ongedaan gemaakt worden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteAccount()
              }}
              variant="destructive"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              Account verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
