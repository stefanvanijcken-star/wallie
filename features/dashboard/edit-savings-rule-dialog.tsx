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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { SavingsJar } from "@/types/savings-jar"
import type { SavingsRule, SavingsRuleFrequency } from "@/types/savings-rule"

const weekDays = [
  { label: "Maandag", value: "1" },
  { label: "Dinsdag", value: "2" },
  { label: "Woensdag", value: "3" },
  { label: "Donderdag", value: "4" },
  { label: "Vrijdag", value: "5" },
  { label: "Zaterdag", value: "6" },
  { label: "Zondag", value: "7" },
]

const monthDays = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1
  return { label: `Dag ${day}`, value: String(day) }
})

type EditSavingsRuleDialogProps = {
  jars: SavingsJar[]
  rule: SavingsRule
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateRule: (rule: SavingsRule) => Promise<boolean>
}

export function EditSavingsRuleDialog({
  jars,
  rule,
  open,
  onOpenChange,
  onUpdateRule,
}: EditSavingsRuleDialogProps) {
  const [name, setName] = useState(rule.name)
  const [amount, setAmount] = useState(String(rule.amount))
  const [frequency, setFrequency] = useState<SavingsRuleFrequency>(
    rule.frequency
  )
  const [scheduleDay, setScheduleDay] = useState(String(rule.scheduleDay))
  const [jarId, setJarId] = useState(rule.jarId)
  const [active, setActive] = useState(rule.active)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const scheduleOptions = frequency === "weekly" ? weekDays : monthDays

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const ruleName = name.trim()
    const amountValue = Number(amount)

    if (!ruleName || !jarId || amountValue <= 0) {
      return
    }

    setIsSubmitting(true)
    const success = await onUpdateRule({
      ...rule,
      name: ruleName,
      amount: amountValue,
      frequency,
      scheduleDay: Number(scheduleDay),
      jarId,
      active,
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
          <DialogTitle>Automatisering bewerken</DialogTitle>
          <DialogDescription>
            Pas de naam, het bedrag, de frequentie of de spaarpot aan.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-rule-name">Naam</Label>
            <Input
              id="edit-rule-name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-rule-amount">Bedrag</Label>
              <Input
                id="edit-rule-amount"
                min="1"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                type="number"
                value={amount}
              />
            </div>
            <div className="grid gap-2">
              <Label>Frequentie</Label>
              <Select
                onValueChange={(value) => {
                  setFrequency(value as SavingsRuleFrequency)
                  setScheduleDay("1")
                }}
                value={frequency}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Wekelijks</SelectItem>
                  <SelectItem value="monthly">Maandelijks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>
              {frequency === "weekly" ? "Dag van de week" : "Dag van de maand"}
            </Label>
            <Select onValueChange={setScheduleDay} value={scheduleDay}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Spaarpot</Label>
            <Select onValueChange={setJarId} value={jarId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kies een spaarpot" />
              </SelectTrigger>
              <SelectContent>
                {jars.map((jar) => (
                  <SelectItem key={jar.id} value={jar.id}>
                    {jar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-muted px-3 py-2">
            <Label htmlFor="edit-rule-active">Actief</Label>
            <Switch
              checked={active}
              id="edit-rule-active"
              onCheckedChange={setActive}
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
              disabled={
                isSubmitting || !jarId || !name.trim() || Number(amount) <= 0
              }
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
