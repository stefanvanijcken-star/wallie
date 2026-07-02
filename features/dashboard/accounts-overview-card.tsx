import { WalletCards } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/features/dashboard/formatters"
import type { SavingsAccount } from "@/types/savings-account"

type AccountsOverviewCardProps = {
  accounts: SavingsAccount[]
  totalAvailable: number
  unassignedSavings: number
  onManageAccounts: () => void
}

export function AccountsOverviewCard({
  accounts,
  onManageAccounts,
  totalAvailable,
  unassignedSavings,
}: AccountsOverviewCardProps) {
  const visibleAccounts = accounts.slice(0, 3)

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <WalletCards className="size-4" aria-hidden="true" />
          Rekeningen
        </div>
        <CardTitle>{formatCurrency(totalAvailable)}</CardTitle>
        <CardDescription>
          {formatCurrency(unassignedSavings)} staat nog vrij.
        </CardDescription>
        <CardAction className="self-start">
          <Button onClick={onManageAccounts} variant="outline">
            Beheren
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2">
        {visibleAccounts.length > 0 ? (
          visibleAccounts.map((account) => (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-3 py-2 text-sm"
              key={account.id}
            >
              <span className="truncate text-muted-foreground">
                {account.name}
              </span>
              <span className="font-medium">
                {formatCurrency(account.balance)}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            Nog geen rekeningen ingevuld.
          </div>
        )}
        {accounts.length > visibleAccounts.length ? (
          <Badge className="w-fit" variant="secondary">
            +{accounts.length - visibleAccounts.length} meer
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  )
}
