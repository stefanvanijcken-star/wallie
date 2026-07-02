"use client"

import { FormEvent, useState } from "react"
import { Loader2, Plus } from "lucide-react"

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
import { iconOptions } from "@/features/dashboard/jar-options"
import { JarAppearancePicker } from "@/features/dashboard/jar-appearance-picker"
import { savingsJarColors } from "@/features/dashboard/savings-jars"
import type { SavingsJar, SavingsJarColor } from "@/types/savings-jar"

type NewSavingsJarDialogProps = {
  availableAmount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateJar: (jar: SavingsJar) => Promise<boolean>
}

export function NewSavingsJarDialog({
  availableAmount,
  open,
  onCreateJar,
  onOpenChange,
}: NewSavingsJarDialogProps) {
  const [name, setName] = useState("")
  const [balance, setBalance] = useState("")
  const [goal, setGoal] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [selectedColor, setSelectedColor] = useState<SavingsJarColor>(
    savingsJarColors[0]
  )
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setName("")
    setBalance("")
    setGoal("")
    setTargetDate("")
    setSelectedColor(savingsJarColors[0])
    setSelectedIcon(iconOptions[0])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const jarName = name.trim()
    const balanceValue = Number(balance) || 0

    if (!jarName || balanceValue > availableAmount) {
      return
    }

    setIsSubmitting(true)
    const success = await onCreateJar({
      id: crypto.randomUUID(),
      name: jarName,
      icon: selectedIcon.icon,
      iconName: selectedIcon.name,
      balance: balanceValue,
      goal: goal ? Number(goal) : undefined,
      targetDate: targetDate || undefined,
      color: selectedColor,
    })
    setIsSubmitting(false)

    if (success) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6">
        <DialogHeader>
          <DialogTitle>Nieuwe spaarpot</DialogTitle>
          <DialogDescription>
            Kies een doel, uiterlijk en eventueel een startsaldo.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="jar-name">Naam</Label>
            <Input
              id="jar-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Bijvoorbeeld: Weekendje weg"
              value={name}
            />
          </div>

          <JarAppearancePicker
            onColorChange={setSelectedColor}
            onIconChange={setSelectedIcon}
            selectedColor={selectedColor}
            selectedIcon={selectedIcon}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="jar-balance">Huidig saldo</Label>
              <Input
                id="jar-balance"
                max={availableAmount}
                min="0"
                onChange={(event) => setBalance(event.target.value)}
                placeholder="0"
                type="number"
                value={balance}
              />
              {Number(balance) > availableAmount ? (
                <p className="text-sm text-destructive">
                  Je hebt maximaal {availableAmount} beschikbaar.
                </p>
              ) : availableAmount <= 0 ? (
                <p className="text-sm text-muted-foreground">
                  Er staat nog geen vrij bedrag klaar; de pot start met 0.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jar-goal">Spaardoel</Label>
              <Input
                id="jar-goal"
                min="0"
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Optioneel"
                type="number"
                value={goal}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jar-target-date">Doeldatum</Label>
            <Input
              id="jar-target-date"
              onChange={(event) => setTargetDate(event.target.value)}
              type="date"
              value={targetDate}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Annuleren
            </Button>
            <Button
              disabled={isSubmitting || Number(balance) > availableAmount}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              Aanmaken
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
