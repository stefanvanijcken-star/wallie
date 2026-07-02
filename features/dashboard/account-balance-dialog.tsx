"use client"

import { FormEvent, useMemo, useState } from "react"
import { Loader2, Plus, Trash2, WalletCards } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/features/dashboard/formatters"
import type { SavingsAccount } from "@/types/savings-account"

type AccountBalanceDialogProps = {
  accounts: SavingsAccount[]
  open: boolean
  totalAssigned: number
  onOpenChange: (open: boolean) => void
  onSaveAccounts: (accounts: SavingsAccount[]) => Promise<boolean>
}

type DraftAccount = {
  id: string
  name: string
  balance: string
}

function toDraftAccount(account: SavingsAccount): DraftAccount {
  return {
    id: account.id,
    name: account.name,
    balance: String(account.balance),
  }
}

function createDraftAccount(): DraftAccount {
  return {
    id: crypto.randomUUID(),
    name: "",
    balance: "",
  }
}

export function AccountBalanceDialog({
  accounts,
  onOpenChange,
  onSaveAccounts,
  open,
  totalAssigned,
}: AccountBalanceDialogProps) {
  const initialTotal = accounts.reduce(
    (total, account) => total + account.balance,
    0
  )
  const [totalBalance, setTotalBalance] = useState(String(initialTotal))
  const [draftAccounts, setDraftAccounts] = useState<DraftAccount[]>(
    accounts.length > 0
      ? accounts.map(toDraftAccount)
      : [{ ...createDraftAccount(), name: "Spaarrekening" }]
  )
  const [accountToDelete, setAccountToDelete] = useState<DraftAccount | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const draftTotal = useMemo(
    () =>
      draftAccounts.reduce(
        (total, account) => total + (Number(account.balance) || 0),
        0
      ),
    [draftAccounts]
  )
  const totalBalanceValue = Number(totalBalance) || 0
  const isTotalTooLow = totalBalanceValue < totalAssigned
  const areAccountsTooLow = draftTotal < totalAssigned

  async function saveTotal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    const success = await onSaveAccounts([
      {
        id: accounts[0]?.id ?? "main-savings",
        name: accounts[0]?.name ?? "Spaarrekening",
        balance: Number(totalBalance) || 0,
      },
    ])
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  async function saveAccounts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    const success = await onSaveAccounts(
      draftAccounts.map((account, index) => ({
        id: account.id,
        name: account.name.trim() || `Rekening ${index + 1}`,
        balance: Number(account.balance) || 0,
      }))
    )
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  function updateDraftAccount(
    accountId: string,
    field: "balance" | "name",
    value: string
  ) {
    setDraftAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === accountId ? { ...account, [field]: value } : account
      )
    )
  }

  function removeDraftAccount(accountId: string) {
    setDraftAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== accountId)
    )
    setAccountToDelete(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100svh-2rem)] sm:max-w-2xl sm:p-6">
          <DialogHeader>
            <DialogTitle>Rekeningen</DialogTitle>
            <DialogDescription>
              Vul je totale spaargeld in of splits het uit per rekening.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="total">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="total">Totaal</TabsTrigger>
              <TabsTrigger value="accounts">Per rekening</TabsTrigger>
            </TabsList>

            <TabsContent value="total">
              <form className="grid gap-5 pt-4" onSubmit={saveTotal}>
                <div className="grid gap-2">
                  <Label htmlFor="total-balance">Totaal spaargeld</Label>
                  <Input
                    id="total-balance"
                    min="0"
                    onChange={(event) => setTotalBalance(event.target.value)}
                    placeholder="0"
                    type="number"
                    value={totalBalance}
                  />
                </div>
                <div className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
                  In potten: {formatCurrency(totalAssigned)}. Nog te verdelen
                  wordt{" "}
                  {formatCurrency(
                    Math.max(0, totalBalanceValue - totalAssigned)
                  )}
                  .
                </div>
                {isTotalTooLow ? (
                  <p className="text-sm text-destructive">
                    Je totaal kan niet lager zijn dan wat al in potten zit:{" "}
                    {formatCurrency(totalAssigned)}.
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    onClick={() => onOpenChange(false)}
                    type="button"
                    variant="outline"
                  >
                    Annuleren
                  </Button>
                  <Button
                    disabled={isSubmitting || isTotalTooLow}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <WalletCards data-icon="inline-start" />
                    )}
                    Opslaan
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="accounts">
              <form className="grid gap-5 pt-4" onSubmit={saveAccounts}>
                <div className="grid gap-3">
                  {draftAccounts.map((account, index) => (
                    <div
                      className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
                      key={account.id}
                    >
                      <div className="grid gap-2">
                        <Label htmlFor={`account-name-${account.id}`}>
                          Rekening
                        </Label>
                        <Input
                          id={`account-name-${account.id}`}
                          onChange={(event) =>
                            updateDraftAccount(
                              account.id,
                              "name",
                              event.target.value
                            )
                          }
                          placeholder={`Rekening ${index + 1}`}
                          value={account.name}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`account-balance-${account.id}`}>
                          Saldo
                        </Label>
                        <Input
                          id={`account-balance-${account.id}`}
                          min="0"
                          onChange={(event) =>
                            updateDraftAccount(
                              account.id,
                              "balance",
                              event.target.value
                            )
                          }
                          placeholder="0"
                          type="number"
                          value={account.balance}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          aria-label="Rekening verwijderen"
                          disabled={draftAccounts.length === 1}
                          onClick={() => setAccountToDelete(account)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="justify-start"
                  onClick={() =>
                    setDraftAccounts((currentAccounts) => [
                      ...currentAccounts,
                      createDraftAccount(),
                    ])
                  }
                  type="button"
                  variant="outline"
                >
                  <Plus data-icon="inline-start" />
                  Rekening toevoegen
                </Button>
                <div className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
                  Totaal: {formatCurrency(draftTotal)}. Nog te verdelen wordt{" "}
                  {formatCurrency(Math.max(0, draftTotal - totalAssigned))}.
                </div>
                {areAccountsTooLow ? (
                  <p className="text-sm text-destructive">
                    Het totaal van je rekeningen moet minimaal{" "}
                    {formatCurrency(totalAssigned)} zijn.
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    onClick={() => onOpenChange(false)}
                    type="button"
                    variant="outline"
                  >
                    Annuleren
                  </Button>
                  <Button
                    disabled={isSubmitting || areAccountsTooLow}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <WalletCards data-icon="inline-start" />
                    )}
                    Opslaan
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(accountToDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setAccountToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rekening verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de rekening{" "}
              {accountToDelete?.name.trim() || "deze rekening"} wilt
              verwijderen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (accountToDelete) {
                  removeDraftAccount(accountToDelete.id)
                }
              }}
              variant="destructive"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
