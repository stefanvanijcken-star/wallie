"use client"

import { FormEvent, useState } from "react"
import { Loader2 } from "lucide-react"

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
import { formatTargetDate } from "@/features/dashboard/formatters"
import { iconOptions } from "@/features/dashboard/jar-options"
import { JarAppearancePicker } from "@/features/dashboard/jar-appearance-picker"
import type { SavingsJar, SavingsJarColor } from "@/types/savings-jar"

type EditSavingsJarDialogProps = {
  jar: SavingsJar
  maxBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateJar: (jar: SavingsJar) => Promise<boolean>
}

export function EditSavingsJarDialog({
  jar,
  maxBalance,
  open,
  onOpenChange,
  onUpdateJar,
}: EditSavingsJarDialogProps) {
  const initialIcon =
    iconOptions.find((option) => option.name === jar.iconName) ?? iconOptions[0]

  const [name, setName] = useState(jar.name)
  const [balance, setBalance] = useState(String(jar.balance))
  const [goal, setGoal] = useState(jar.goal ? String(jar.goal) : "")
  const [targetDate, setTargetDate] = useState(jar.targetDate ?? "")
  const [selectedColor, setSelectedColor] = useState<SavingsJarColor>(jar.color)
  const [selectedIcon, setSelectedIcon] = useState(initialIcon)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const jarName = name.trim()
    const balanceValue = Number(balance) || 0

    if (!jarName || balanceValue > maxBalance) {
      return
    }

    setIsSubmitting(true)
    const success = await onUpdateJar({
      ...jar,
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
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6">
        <DialogHeader>
          <DialogTitle>Spaarpot bewerken</DialogTitle>
          <DialogDescription>
            Pas de pot aan zonder boven je totale spaargeld uit te komen.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-jar-name">Naam</Label>
            <Input
              id="edit-jar-name"
              onChange={(event) => setName(event.target.value)}
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
              <Label htmlFor="edit-jar-balance">Huidig saldo</Label>
              <Input
                id="edit-jar-balance"
                max={maxBalance}
                min="0"
                onChange={(event) => setBalance(event.target.value)}
                type="number"
                value={balance}
              />
              {Number(balance) > maxBalance ? (
                <p className="text-sm text-destructive">
                  Dit saldo past niet binnen je totale spaargeld.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-jar-goal">Spaardoel</Label>
              <Input
                id="edit-jar-goal"
                min="0"
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Optioneel"
                type="number"
                value={goal}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-jar-target-date">
              Doeldatum
              {jar.targetDate ? (
                <span className="font-normal text-muted-foreground">
                  {formatTargetDate(jar.targetDate)}
                </span>
              ) : null}
            </Label>
            <Input
              id="edit-jar-target-date"
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
              disabled={isSubmitting || Number(balance) > maxBalance}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              Opslaan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
