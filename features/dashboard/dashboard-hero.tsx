import { PiggyBank } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, getProgress } from "@/features/dashboard/formatters"

type DashboardHeroProps = {
  activeJarCount: number
  totalAvailable: number
  totalGoal: number
  totalSaved: number
  unassignedSavings: number
}

export function DashboardHero({
  activeJarCount,
  totalAvailable,
  totalGoal,
  totalSaved,
  unassignedSavings,
}: DashboardHeroProps) {
  const progress = getProgress(totalSaved, totalGoal)

  return (
    <Card className="border border-primary/15 bg-primary/5 shadow-none">
      <CardHeader className="gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
          <PiggyBank className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Totaal gespaard</p>
          <p className="text-4xl font-medium tracking-tight sm:text-5xl">
            {formatCurrency(totalSaved)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Verdeeld over {activeJarCount}{" "}
            {activeJarCount === 1 ? "spaarpot" : "spaarpotten"}
            {totalGoal > 0 ? ` · ${progress}% van alle doelen` : ""}
          </p>
        </div>
        {totalGoal > 0 ? (
          <Progress className="h-3 bg-background/80" value={progress} />
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 border-t border-primary/10 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Nog te verdelen</p>
            <p className="text-lg font-medium">
              {formatCurrency(unassignedSavings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">In rekeningen</p>
            <p className="text-lg font-medium">
              {formatCurrency(totalAvailable)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
