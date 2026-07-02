"use client"

import { useState } from "react"
import {
  BarChart3,
  CircleGauge,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatCurrency } from "@/features/dashboard/formatters"
import type { SavingsJar } from "@/types/savings-jar"
import type { Transaction } from "@/types/transaction"

const savingsTrendConfig = {
  total: {
    label: "Totaal",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const jarDistributionConfig = {
  value: {
    label: "Saldo",
  },
} satisfies ChartConfig

type Period = "week" | "maand" | "alles"

const periodLabels: Record<Period, string> = {
  week: "Week",
  maand: "Maand",
  alles: "Alles",
}

type AnalyticsSectionProps = {
  jars: SavingsJar[]
  totalSaved: number
  transactions: Transaction[]
  compact?: boolean
  onCreateJar?: () => void
  onManageAccounts?: () => void
}

function getTransactionImpact(transaction: Transaction) {
  if (!transaction.amount) {
    return 0
  }

  if (
    transaction.type === "money_distributed" ||
    transaction.type === "rule_run"
  ) {
    return transaction.amount
  }

  if (transaction.type === "jar_deleted") {
    return -transaction.amount
  }

  return 0
}

function filterByPeriod(transactions: Transaction[], period: Period) {
  if (period === "alles") return transactions

  const now = new Date()
  const cutoff = new Date(now)
  if (period === "week") {
    cutoff.setDate(now.getDate() - 7)
  } else {
    cutoff.setMonth(now.getMonth() - 1)
  }

  return transactions.filter((t) => new Date(t.createdAt) >= cutoff)
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatChartDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
  }).format(date)
}

function buildSavingsTrend(transactions: Transaction[], totalSaved: number) {
  const relevantTransactions = transactions.filter(
    (transaction) => getTransactionImpact(transaction) !== 0
  )
  const totalImpact = relevantTransactions.reduce(
    (sum, transaction) => sum + getTransactionImpact(transaction),
    0
  )

  if (relevantTransactions.length === 0) {
    return [
      {
        label: "Nu",
        total: totalSaved,
      },
    ]
  }

  const impactByDay = new Map<string, number>()

  relevantTransactions.forEach((transaction) => {
    const dateKey = getDateKey(new Date(transaction.createdAt))

    impactByDay.set(
      dateKey,
      (impactByDay.get(dateKey) ?? 0) + getTransactionImpact(transaction)
    )
  })

  const sortedDayKeys = [...impactByDay.keys()].sort()
  const startDate = new Date(`${sortedDayKeys[0]}T00:00:00`)
  const endDate = new Date()
  const points: Array<{ label: string; total: number }> = []
  let runningTotal = Math.max(totalSaved - totalImpact, 0)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateKey = getDateKey(currentDate)

    runningTotal += impactByDay.get(dateKey) ?? 0
    points.push({
      label: formatChartDate(currentDate),
      total: Math.max(runningTotal, 0),
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return points
}

function formatPieLabel({
  name,
  percent,
}: {
  name?: string
  percent?: number
}) {
  return `${name ?? "Spaarpot"} ${Math.round((percent ?? 0) * 100)}%`
}

function getPositiveImpact(transactions: Transaction[]) {
  return transactions.reduce((sum, transaction) => {
    const impact = getTransactionImpact(transaction)

    return impact > 0 ? sum + impact : sum
  }, 0)
}

export function AnalyticsSection({
  compact = false,
  jars,
  onCreateJar,
  onManageAccounts,
  totalSaved,
  transactions,
}: AnalyticsSectionProps) {
  const [period, setPeriod] = useState<Period>("maand")
  const effectivePeriod = compact ? "maand" : period

  const filteredTransactions = filterByPeriod(transactions, effectivePeriod)
  const savingsTrend = buildSavingsTrend(filteredTransactions, totalSaved)
  const totalGoal = jars.reduce((sum, jar) => sum + (jar.goal ?? 0), 0)
  const completedGoals = jars.filter(
    (jar) => jar.goal != null && jar.balance >= jar.goal
  ).length
  const remainingToGoals = jars.reduce(
    (sum, jar) => sum + Math.max((jar.goal ?? 0) - jar.balance, 0),
    0
  )
  const periodAdded = getPositiveImpact(filteredTransactions)
  const averageJarBalance = jars.length > 0 ? totalSaved / jars.length : 0
  const largestJar = jars.reduce<SavingsJar | null>(
    (largest, jar) =>
      !largest || jar.balance > largest.balance ? jar : largest,
    null
  )
  const goalProgress =
    totalGoal > 0
      ? Math.min(Math.round((totalSaved / totalGoal) * 100), 100)
      : 0
  const jarDistribution = jars
    .filter((jar) => jar.balance > 0)
    .slice(0, 5)
    .map((jar) => ({
      name: jar.name,
      value: jar.balance,
      dotClass: jar.color.barClass,
      fill: jar.color.chartColor,
    }))

  if (jars.length === 0) {
    return (
      <section>
        <Card className="border border-dashed border-border/80 bg-muted/25 shadow-none">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-background text-muted-foreground ring-1 ring-border">
              <BarChart3 className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Nog geen analytics</CardTitle>
            <CardDescription>
              Maak een spaarpot om verdeling en ontwikkeling te kunnen zien.
            </CardDescription>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              {onCreateJar ? (
                <Button onClick={onCreateJar}>
                  <Plus data-icon="inline-start" />
                  Nieuwe spaarpot
                </Button>
              ) : null}
              {onManageAccounts ? (
                <Button onClick={onManageAccounts} variant="outline">
                  <WalletCards data-icon="inline-start" />
                  Rekeningen
                </Button>
              ) : null}
            </div>
          </CardHeader>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid gap-4">
      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="border border-border/60 shadow-sm" size="sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <CircleGauge className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>{goalProgress}%</CardTitle>
              <CardDescription>Van alle doelen gehaald</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border/60 shadow-sm" size="sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Target className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>{formatCurrency(remainingToGoals)}</CardTitle>
              <CardDescription>Nog nodig voor doelen</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border/60 shadow-sm" size="sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <TrendingUp className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>{formatCurrency(periodAdded)}</CardTitle>
              <CardDescription>Verdeeld in deze periode</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border/60 shadow-sm" size="sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Trophy className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>
                {completedGoals}/{jars.filter((jar) => jar.goal).length}
              </CardTitle>
              <CardDescription>Doelen afgerond</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border/60 shadow-sm" size="sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <WalletCards className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>{formatCurrency(averageJarBalance)}</CardTitle>
              <CardDescription>
                Gemiddeld per pot
                {largestJar ? ` - grootste: ${largestJar.name}` : ""}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      <div
        className={
          compact ? "grid gap-4" : "grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        }
      >
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Spaargeld over tijd</CardTitle>
                <CardDescription>
                  Ontwikkeling op basis van verdelingen en automatiseringen.
                </CardDescription>
              </div>
              {!compact ? (
                <ToggleGroup
                  onValueChange={(value) => {
                    if (value) {
                      setPeriod(value as Period)
                    }
                  }}
                  spacing={0}
                  type="single"
                  value={period}
                  variant="outline"
                >
                  {(["week", "maand", "alles"] as Period[]).map((p) => (
                    <ToggleGroupItem key={p} value={p}>
                      {periodLabels[p]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className={compact ? "h-40 w-full" : "h-64 w-full"}
              config={savingsTrendConfig}
            >
              <AreaChart data={savingsTrend} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="total"
                  fill="var(--color-total)"
                  fillOpacity={0.18}
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {!compact ? (
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Verdeling per pot</CardTitle>
              <CardDescription>Waar je spaargeld nu staat.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {jarDistribution.length > 0 ? (
                <>
                  <ChartContainer
                    className="mx-auto aspect-square h-56"
                    config={jarDistributionConfig}
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => (
                              <>
                                <span className="text-muted-foreground">
                                  {String(name)}
                                </span>
                                <span className="font-mono font-medium text-foreground tabular-nums">
                                  {formatCurrency(Number(value))}
                                </span>
                              </>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={jarDistribution}
                        dataKey="value"
                        innerRadius={52}
                        label={formatPieLabel}
                        labelLine={false}
                        nameKey="name"
                        outerRadius={84}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid gap-2">
                    {jarDistribution.map((item) => (
                      <div
                        className="flex items-center justify-between gap-3 text-sm"
                        key={item.name}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`size-2.5 rounded-full ${item.dotClass}`}
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-3 rounded-2xl bg-muted px-3 py-3 text-sm text-muted-foreground">
                  <span>Nog geen verdeeld spaargeld.</span>
                  {onCreateJar ? (
                    <Button
                      className="w-fit"
                      onClick={onCreateJar}
                      variant="outline"
                    >
                      <Plus data-icon="inline-start" />
                      Spaarpot maken
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  )
}
