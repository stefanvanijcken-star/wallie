"use client"

import {
  ArrowRightLeft,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatCurrency,
  formatDateTime,
  formatTargetDate,
  getProgress,
} from "@/features/dashboard/formatters"
import { useIsMobile } from "@/hooks/use-mobile"
import type { SavingsJar } from "@/types/savings-jar"
import type { SavingsRule, SavingsRuleFrequency } from "@/types/savings-rule"
import type { Transaction } from "@/types/transaction"

const frequencyLabels: Record<SavingsRuleFrequency, string> = {
  weekly: "Wekelijks",
  monthly: "Maandelijks",
}

type SavingsJarDetailSheetProps = {
  jar: SavingsJar | null
  rules: SavingsRule[]
  transactions: Transaction[]
  open: boolean
  onDelete: (jar: SavingsJar) => void
  onEdit: (jar: SavingsJar) => void
  onMoveMoney: (jar: SavingsJar) => void
  onOpenChange: (open: boolean) => void
}

export function SavingsJarDetailSheet({
  jar,
  open,
  onDelete,
  onEdit,
  onMoveMoney,
  onOpenChange,
  rules,
  transactions,
}: SavingsJarDetailSheetProps) {
  const isMobile = useIsMobile()

  if (!jar) {
    return null
  }

  const Icon = jar.icon
  const progress = getProgress(jar.balance, jar.goal)
  const jarRules = rules.filter((rule) => rule.jarId === jar.id)
  const jarTransactions = transactions.filter(
    (transaction) => transaction.jarId === jar.id
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full overflow-y-auto max-md:h-[92svh] max-md:rounded-t-3xl sm:max-w-xl"
        side={isMobile ? "bottom" : "right"}
      >
        <SheetHeader className="p-4 pr-24 sm:p-6 sm:pr-24">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-12 items-center justify-center rounded-2xl ring-1 ${jar.color.accentClass}`}
            >
              <Icon className="size-6" aria-hidden="true" />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="absolute top-4 right-14"
                size="icon-sm"
                variant="secondary"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
                <span className="sr-only">Acties</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMoveMoney(jar)}>
                <ArrowRightLeft />
                Geld verplaatsen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(jar)}>
                <Pencil />
                Bewerken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(jar)}
                variant="destructive"
              >
                <Trash2 />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SheetTitle>{jar.name}</SheetTitle>
          <SheetDescription>
            Saldo, voortgang, automatiseringen en activiteit voor deze spaarpot.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-5 px-4 sm:px-6">
          <div className="grid gap-3 rounded-2xl bg-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="text-3xl font-medium">
                  {formatCurrency(jar.balance)}
                </p>
              </div>
              <Badge variant="secondary">{progress}%</Badge>
            </div>
            <Progress
              className="bg-background"
              indicatorClassName={jar.color.barClass}
              value={progress}
            />
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overzicht</TabsTrigger>
              <TabsTrigger value="activity">Activiteit</TabsTrigger>
              <TabsTrigger value="rules">Automatisch</TabsTrigger>
            </TabsList>

            <TabsContent className="grid gap-4 pt-3" value="overview">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 p-3">
                  <p className="text-muted-foreground">Spaardoel</p>
                  <p className="font-medium">
                    {jar.goal ? formatCurrency(jar.goal) : "Geen doel"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-3">
                  <p className="text-muted-foreground">Doeldatum</p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatTargetDate(jar.targetDate)}
                  </p>
                </div>
              </div>
              <Button onClick={() => onMoveMoney(jar)}>
                <ArrowRightLeft data-icon="inline-start" />
                Geld verplaatsen
              </Button>
            </TabsContent>

            <TabsContent className="grid gap-2 pt-3" value="activity">
              {jarTransactions.length > 0 ? (
                jarTransactions.slice(0, 8).map((transaction) => (
                  <div
                    className="grid gap-1 rounded-2xl border border-border/60 px-3 py-2 text-sm"
                    key={transaction.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{transaction.title}</p>
                      {transaction.amount ? (
                        <Badge variant="secondary">
                          {formatCurrency(transaction.amount)}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Nog geen activiteit voor deze spaarpot.
                </p>
              )}
            </TabsContent>

            <TabsContent className="grid gap-2 pt-3" value="rules">
              {jarRules.length > 0 ? (
                jarRules.map((rule) => (
                  <div
                    className="grid gap-2 rounded-2xl border border-border/60 px-3 py-2 text-sm"
                    key={rule.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{rule.name}</p>
                      <Badge variant={rule.active ? "secondary" : "outline"}>
                        {rule.active ? "Actief" : "Inactief"}
                      </Badge>
                    </div>
                    <Separator />
                    <p className="text-muted-foreground">
                      {frequencyLabels[rule.frequency]} -{" "}
                      {formatCurrency(rule.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Geen automatiseringen voor deze spaarpot.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
