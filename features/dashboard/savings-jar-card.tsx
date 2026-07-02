import { CalendarDays, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  formatCurrency,
  formatTargetDate,
  getProgress,
} from "@/features/dashboard/formatters"
import type { SavingsJar } from "@/types/savings-jar"

type SavingsJarCardProps = {
  jar: SavingsJar
  onOpenDetail: (jar: SavingsJar) => void
}

export function SavingsJarCard({ jar, onOpenDetail }: SavingsJarCardProps) {
  const Icon = jar.icon
  const progress = getProgress(jar.balance, jar.goal)
  const goalLabel = jar.goal ? formatCurrency(jar.goal) : "Geen doel"
  const goalReached = jar.goal != null && jar.balance >= jar.goal
  const isExpired =
    jar.targetDate != null &&
    !goalReached &&
    new Date(jar.targetDate) < new Date()

  return (
    <Card
      className="border border-border/60 shadow-sm transition-colors [--card-spacing:--spacing(3)] hover:bg-muted/30 sm:[--card-spacing:--spacing(4)]"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpenDetail(jar)
        }
      }}
      onClick={() => onOpenDetail(jar)}
      role="button"
      size="sm"
      tabIndex={0}
    >
      <CardHeader>
        <div
          className={`flex size-9 items-center justify-center rounded-2xl ring-1 sm:size-10 ${jar.color.accentClass}`}
        >
          <Icon className="size-4.5 sm:size-5" aria-hidden="true" />
        </div>
        <CardTitle className="truncate text-sm sm:text-base">
          {jar.name}
        </CardTitle>
        <CardDescription className="truncate text-xs sm:text-sm">
          {formatCurrency(jar.balance)} gespaard
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:gap-3">
        <div className="grid gap-0.5 text-xs sm:flex sm:items-center sm:justify-between sm:text-sm">
          <span className="text-muted-foreground">Doel</span>
          <span className="truncate font-medium">{goalLabel}</span>
        </div>
        {jar.goal ? (
          <Progress indicatorClassName={jar.color.barClass} value={progress} />
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
        <span className="flex min-w-0 items-center gap-1.5">
          <CalendarDays
            className="size-3.5 shrink-0 sm:size-4"
            aria-hidden="true"
          />
          <span
            className={`truncate ${isExpired ? "text-amber-600 dark:text-amber-400" : ""}`}
          >
            {formatTargetDate(jar.targetDate)}
          </span>
          {isExpired ? (
            <Badge
              className="hidden shrink-0 bg-amber-100 text-amber-700 ring-amber-200 min-[380px]:inline-flex dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20"
              variant="outline"
            >
              Verlopen
            </Badge>
          ) : null}
        </span>
        {goalReached ? (
          <Badge
            className="shrink-0 gap-1 bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20"
            variant="outline"
          >
            <CheckCircle2 className="size-3" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">Bereikt</span>
          </Badge>
        ) : jar.goal ? (
          <Badge variant="secondary">{progress}%</Badge>
        ) : null}
      </CardFooter>
    </Card>
  )
}
