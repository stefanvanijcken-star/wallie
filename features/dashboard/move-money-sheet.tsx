"use client"

import { FormEvent, useMemo, useState } from "react"
import { ArrowRightLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/features/dashboard/formatters"
import { useIsMobile } from "@/hooks/use-mobile"
import type { SavingsJar } from "@/types/savings-jar"

export const unassignedSourceId = "unassigned"

type MoveMoneySheetProps = {
  jars: SavingsJar[]
  open: boolean
  preferredTargetId?: string
  unassignedAmount: number
  onMoveMoney: (sourceId: string, targetId: string, amount: number) => void
  onOpenChange: (open: boolean) => void
}

export function MoveMoneySheet({
  jars,
  onMoveMoney,
  onOpenChange,
  open,
  preferredTargetId,
  unassignedAmount,
}: MoveMoneySheetProps) {
  const isMobile = useIsMobile()
  const [amount, setAmount] = useState("")
  const [amountTouched, setAmountTouched] = useState(false)
  const [sourceId, setSourceId] = useState(unassignedSourceId)
  const [targetId, setTargetId] = useState(
    preferredTargetId ?? jars[0]?.id ?? unassignedSourceId
  )

  const accounts = useMemo(
    () => [
      {
        id: unassignedSourceId,
        label: "Nog te verdelen",
        balance: unassignedAmount,
      },
      ...jars.map((jar) => ({
        id: jar.id,
        label: jar.name,
        balance: jar.balance,
      })),
    ],
    [jars, unassignedAmount]
  )

  const source = accounts.find((account) => account.id === sourceId)
  const target = accounts.find((account) => account.id === targetId)
  const amountValue = Number(amount)
  const hasMoveOptions = accounts.length > 1
  const isValidAmount =
    hasMoveOptions &&
    amountValue > 0 &&
    Boolean(source) &&
    Boolean(target) &&
    sourceId !== targetId &&
    amountValue <= (source?.balance ?? 0)

  function resetForm() {
    setAmount("")
    setAmountTouched(false)
    setSourceId(unassignedSourceId)
    setTargetId(preferredTargetId ?? jars[0]?.id ?? unassignedSourceId)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isValidAmount) {
      return
    }

    onMoveMoney(sourceId, targetId, amountValue)
    resetForm()
    onOpenChange(false)
  }

  function handleSetMax() {
    if (source) {
      setAmount(String(source.balance))
      setAmountTouched(true)
    }
  }

  const showAmountError = amountTouched && amount !== "" && !isValidAmount

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full overflow-y-auto max-md:h-[90svh] max-md:rounded-t-3xl sm:max-w-md"
        side={isMobile ? "bottom" : "right"}
      >
        <SheetHeader className="p-4 sm:p-6">
          <SheetTitle>Geld verplaatsen</SheetTitle>
          <SheetDescription>
            Kies een bron, bestemming en bedrag. Wallie bewaakt dat je totaal
            blijft kloppen.
          </SheetDescription>
        </SheetHeader>

        <form className="grid gap-5 px-4 sm:px-6" onSubmit={handleSubmit}>
          {!hasMoveOptions ? (
            <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              Maak eerst een spaarpot voordat je geld kunt verplaatsen.
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Van</Label>
            <Select
              disabled={!hasMoveOptions}
              onValueChange={(value) => {
                setSourceId(value)
                setAmountTouched(false)
                setAmount("")
              }}
              value={sourceId}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.label} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Naar</Label>
            <Select
              disabled={!hasMoveOptions}
              onValueChange={setTargetId}
              value={targetId}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.label} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="move-amount">Bedrag</Label>
              {source && source.balance > 0 ? (
                <button
                  className="text-xs text-primary underline-offset-2 hover:underline"
                  onClick={handleSetMax}
                  type="button"
                >
                  Max ({formatCurrency(source.balance)})
                </button>
              ) : null}
            </div>
            <Input
              id="move-amount"
              disabled={!hasMoveOptions}
              max={source?.balance}
              min="1"
              onBlur={() => setAmountTouched(true)}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              type="number"
              value={amount}
            />
            {showAmountError ? (
              <p className="text-sm text-destructive">
                {sourceId === targetId
                  ? "Kies twee verschillende plekken."
                  : amountValue > (source?.balance ?? 0)
                    ? `Maximaal ${formatCurrency(source?.balance ?? 0)} beschikbaar.`
                    : "Voer een geldig bedrag in."}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl bg-muted px-3 py-2 text-sm">
            {isValidAmount ? (
              <span>
                {formatCurrency(amountValue)} van {source?.label} naar{" "}
                {target?.label}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {hasMoveOptions
                  ? "Kies bron, doel en bedrag om de verplaatsing te bekijken."
                  : "Er is nog geen bestemming beschikbaar."}
              </span>
            )}
          </div>

          <SheetFooter className="px-0 pb-4 sm:pb-0">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Annuleren
            </Button>
            <Button disabled={!isValidAmount} type="submit">
              <ArrowRightLeft data-icon="inline-start" />
              Verplaatsen
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
