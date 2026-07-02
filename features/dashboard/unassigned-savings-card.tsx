import { ArrowUpRight, Coins } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/features/dashboard/formatters"

type UnassignedSavingsCardProps = {
  amount: number
  onDistribute: () => void
}

export function UnassignedSavingsCard({
  amount,
  onDistribute,
}: UnassignedSavingsCardProps) {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="size-4" aria-hidden="true" />
          Nog te verdelen
        </div>
        <CardTitle className="text-4xl font-medium tracking-normal">
          {formatCurrency(amount)}
        </CardTitle>
        <CardDescription>
          Spaargeld dat nog niet aan een spaarpot is toegewezen.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">Beschikbaar</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Verdeel dit bedrag wanneer je een doel wilt versnellen.
        </p>
        <Button disabled={amount <= 0} onClick={onDistribute} variant="outline">
          Verdelen
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}
