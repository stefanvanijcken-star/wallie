"use client"

import { ChangeEvent, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Loader2, Trash2, Upload } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import {
  clearDashboardState,
  exportDashboardState,
  importDashboardState,
} from "@/features/dashboard/dashboard-storage"
import type { DashboardState } from "@/features/dashboard/dashboard-storage"

type SettingsDialogProps = {
  state: DashboardState
  isDemoMode: boolean
  open: boolean
  onClearData: () => void
  onImportData: (state: DashboardState) => void
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({
  isDemoMode,
  state,
  open,
  onClearData,
  onImportData,
  onOpenChange,
}: SettingsDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState("")
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [isDeleteAccountConfirmOpen, setIsDeleteAccountConfirmOpen] =
    useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  function handleExport() {
    const exportValue = exportDashboardState(state)
    const blob = new Blob([exportValue], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `wallie-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const importedState = importDashboardState(String(reader.result))

        onImportData(importedState)
        setImportError("")
        onOpenChange(false)
      } catch {
        setImportError("Dit bestand lijkt geen geldige Wallie-export te zijn.")
      } finally {
        event.target.value = ""
      }
    }

    reader.readAsText(file)
  }

  async function handleDeleteAccount() {
    if (isDeletingAccount) {
      return
    }

    setIsDeletingAccount(true)

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
      setIsDeleteAccountConfirmOpen(false)
      onOpenChange(false)
      router.replace("/login")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Account verwijderen is niet gelukt."
      )
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6">
          <DialogHeader>
            <DialogTitle>Instellingen</DialogTitle>
            <DialogDescription>
              {isDemoMode
                ? "Beheer de demo-data op dit apparaat."
                : "Beheer je Wallie-accountdata."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-2 rounded-2xl bg-muted p-3">
              <p className="text-sm font-medium">Exporteren</p>
              <p className="text-sm text-muted-foreground">
                Download je spaarpotten, automatiseringen en activiteit als
                JSON-bestand.
              </p>
              <Button
                className="justify-start"
                onClick={handleExport}
                variant="outline"
              >
                <Download data-icon="inline-start" />
                Export downloaden
              </Button>
            </div>

            <div className="grid gap-2 rounded-2xl bg-muted p-3">
              <Label htmlFor="wallie-import">Importeren</Label>
              <p className="text-sm text-muted-foreground">
                {isDemoMode
                  ? "Importeer een eerder gedownloade demo-export."
                  : "Importeer een eerder gedownloade Wallie-export naar je account."}
              </p>
              <Input
                accept="application/json,.json"
                className="hidden"
                id="wallie-import"
                onChange={handleImport}
                ref={fileInputRef}
                type="file"
              />
              <Button
                className="justify-start"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                variant="outline"
              >
                <Upload data-icon="inline-start" />
                Bestand kiezen
              </Button>
              {importError ? (
                <p className="text-sm text-destructive">{importError}</p>
              ) : null}
            </div>

            <div className="grid gap-2 rounded-2xl bg-muted p-3">
              <p className="text-sm font-medium">Wissen</p>
              <p className="text-sm text-muted-foreground">
                {isDemoMode
                  ? "Verwijder alle demo-data permanent van dit apparaat."
                  : "Verwijder je rekeningen, spaarpotten, automatiseringen en activiteit uit je account."}
              </p>
              <Button
                onClick={() => setIsClearConfirmOpen(true)}
                type="button"
                variant="destructive"
                className="justify-start"
              >
                <Trash2 data-icon="inline-start" />
                Alles wissen
              </Button>
            </div>

            {!isDemoMode ? (
              <div className="grid gap-2 rounded-2xl bg-muted p-3">
                <p className="text-sm font-medium">Account verwijderen</p>
                <p className="text-sm text-muted-foreground">
                  Verwijder je Wallie-account, je login en alle data permanent
                  uit Supabase.
                </p>
                <Button
                  className="justify-start"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteAccountConfirmOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  {isDeletingAccount ? (
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Trash2 data-icon="inline-start" />
                  )}
                  Account verwijderen
                </Button>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setIsClearConfirmOpen}
        open={isClearConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alles wissen?</AlertDialogTitle>
            <AlertDialogDescription>
              {isDemoMode
                ? "Alle demo-data op dit apparaat wordt permanent verwijderd. Dit kan niet ongedaan gemaakt worden."
                : "Al je rekeningen, spaarpotten, automatiseringen en activiteit worden permanent verwijderd uit je account. Dit kan niet ongedaan gemaakt worden."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearData()
                setIsClearConfirmOpen(false)
                onOpenChange(false)
              }}
              variant="destructive"
            >
              Alles wissen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!isDeletingAccount) {
            setIsDeleteAccountConfirmOpen(open)
          }
        }}
        open={isDeleteAccountConfirmOpen}
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
            <AlertDialogCancel disabled={isDeletingAccount}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingAccount}
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteAccount()
              }}
              variant="destructive"
            >
              {isDeletingAccount ? (
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
