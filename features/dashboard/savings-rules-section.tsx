"use client"

import { CalendarClock, Pencil, Play, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatCurrency,
  getNextRunLabel,
} from "@/features/dashboard/formatters"
import type { SavingsJar } from "@/types/savings-jar"
import type { SavingsRule, SavingsRuleFrequency } from "@/types/savings-rule"

const frequencyLabels: Record<SavingsRuleFrequency, string> = {
  weekly: "Wekelijks",
  monthly: "Maandelijks",
}

const weekDayLabels: Record<number, string> = {
  1: "maandag",
  2: "dinsdag",
  3: "woensdag",
  4: "donderdag",
  5: "vrijdag",
  6: "zaterdag",
  7: "zondag",
}

function getScheduleLabel(rule: SavingsRule) {
  if (rule.frequency === "weekly") {
    return weekDayLabels[rule.scheduleDay] ?? "maandag"
  }

  return `dag ${rule.scheduleDay}`
}

type SavingsRulesSectionProps = {
  jars: SavingsJar[]
  rules: SavingsRule[]
  showAll?: boolean
  unassignedSavings: number
  onCreateJar: () => void
  onCreateRule: () => void
  onDeleteRule: (ruleId: string) => void
  onEditRule: (rule: SavingsRule) => void
  onRunRule: (ruleId: string) => void
  onToggleRule: (ruleId: string, active: boolean) => void
}

export function SavingsRulesSection({
  jars,
  onCreateJar,
  rules,
  showAll = false,
  unassignedSavings,
  onCreateRule,
  onDeleteRule,
  onEditRule,
  onRunRule,
  onToggleRule,
}: SavingsRulesSectionProps) {
  const visibleRules = showAll ? rules : rules.slice(0, 3)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-normal">
            Automatisch sparen
          </h2>
          <p className="text-sm text-muted-foreground">
            Zet terugkerende verdelingen klaar en voer ze handmatig uit.
          </p>
        </div>
        <Button disabled={jars.length === 0} onClick={onCreateRule}>
          <Plus data-icon="inline-start" />
          Nieuwe automatisering
        </Button>
      </div>

      {rules.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {visibleRules.map((rule) => {
            const jar = jars.find((item) => item.id === rule.jarId)
            const Icon = jar?.icon ?? CalendarClock
            const canRun =
              rule.active && Boolean(jar) && rule.amount <= unassignedSavings

            return (
              <Card
                className="border border-border/60 shadow-sm"
                key={rule.id}
                size="sm"
              >
                <CardHeader>
                  <div
                    className={`flex size-10 items-center justify-center rounded-2xl ring-1 ${
                      jar?.color.accentClass ??
                      "bg-muted text-muted-foreground ring-border"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardAction className="flex items-center gap-2">
                    <Switch
                      aria-label={`${rule.name} aan of uit zetten`}
                      checked={rule.active}
                      onCheckedChange={(active) =>
                        onToggleRule(rule.id, active)
                      }
                      size="sm"
                    />
                    <Button
                      aria-label={`${rule.name} bewerken`}
                      onClick={() => onEditRule(rule)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label={`${rule.name} verwijderen`}
                      onClick={() => onDeleteRule(rule.id)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </CardAction>
                  <CardTitle>{rule.name}</CardTitle>
                  <CardDescription>
                    {formatCurrency(rule.amount)} naar{" "}
                    {jar?.name ?? "Onbekende spaarpot"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Badge variant={rule.active ? "secondary" : "outline"}>
                    {rule.active ? "Actief" : "Inactief"}
                  </Badge>
                  <Badge variant="outline">
                    {frequencyLabels[rule.frequency]}
                  </Badge>
                  <Badge variant="outline">{getScheduleLabel(rule)}</Badge>
                </CardContent>
                <CardFooter className="justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {getNextRunLabel(rule)}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={canRun ? -1 : 0}>
                        <Button
                          className="pointer-events-auto"
                          disabled={!canRun}
                          onClick={() => onRunRule(rule.id)}
                          variant="outline"
                        >
                          <Play data-icon="inline-start" />
                          Uitvoeren
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!canRun ? (
                      <TooltipContent side="top">
                        {!rule.active
                          ? "Zet de automatisering aan om uit te voeren"
                          : !jar
                            ? "Spaarpot niet gevonden"
                            : `Onvoldoende vrij saldo (${formatCurrency(rule.amount - unassignedSavings)} tekort)`}
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-border/80 bg-muted/25 shadow-none">
          <CardHeader>
            <CardTitle>Geen automatiseringen</CardTitle>
            <CardDescription>
              {jars.length > 0
                ? "Maak je eerste automatisering om vaste bedragen sneller te verdelen."
                : "Maak eerst een spaarpot en zet daarna een vaste verdeling klaar."}
            </CardDescription>
            <div className="pt-2">
              {jars.length > 0 ? (
                <Button onClick={onCreateRule}>
                  <Plus data-icon="inline-start" />
                  Nieuwe automatisering
                </Button>
              ) : (
                <Button onClick={onCreateJar}>
                  <Plus data-icon="inline-start" />
                  Nieuwe spaarpot
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>
      )}
    </section>
  )
}
