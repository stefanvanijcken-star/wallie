"use client"

import { useState } from "react"
import {
  Activity,
  ArrowRightLeft,
  CirclePlus,
  Filter,
  Pencil,
  Play,
  Trash2,
  WalletCards,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDateTime } from "@/features/dashboard/formatters"
import type {
  Transaction,
  TransactionDetailValue,
  TransactionType,
} from "@/types/transaction"

const PAGE_SIZE = 8

const transactionIcons: Record<TransactionType, LucideIcon> = {
  accounts_updated: WalletCards,
  jar_created: CirclePlus,
  jar_deleted: Trash2,
  jar_updated: Pencil,
  money_distributed: ArrowRightLeft,
  money_moved: ArrowRightLeft,
  rule_created: CirclePlus,
  rule_deleted: Trash2,
  rule_updated: Pencil,
  rule_run: Play,
}

const transactionLabels: Record<TransactionType, string> = {
  accounts_updated: "Rekeningen",
  jar_created: "Spaarpot",
  jar_deleted: "Spaarpot",
  jar_updated: "Spaarpot",
  money_distributed: "Verdeling",
  money_moved: "Verplaatsing",
  rule_created: "Automatisch",
  rule_deleted: "Automatisch",
  rule_updated: "Automatisch",
  rule_run: "Automatisch",
}

type FilterGroup =
  "alles" | "verdelingen" | "spaarpotten" | "automatisch" | "rekeningen"

const filterGroups: Record<
  FilterGroup,
  { label: string; types: TransactionType[] }
> = {
  alles: { label: "Alles", types: [] },
  verdelingen: {
    label: "Verdelingen",
    types: ["money_distributed", "money_moved"],
  },
  spaarpotten: {
    label: "Spaarpotten",
    types: ["jar_created", "jar_deleted", "jar_updated"],
  },
  automatisch: {
    label: "Automatisch",
    types: ["rule_created", "rule_deleted", "rule_updated", "rule_run"],
  },
  rekeningen: { label: "Rekeningen", types: ["accounts_updated"] },
}

type ActivitySectionProps = {
  transactions: Transaction[]
  preview?: boolean
  onCreateJar?: () => void
}

function formatDetailValue(value: TransactionDetailValue) {
  if (value == null || value === "") return "Niet ingevuld"
  if (typeof value === "boolean") return value ? "Ja" : "Nee"
  if (typeof value === "number") return String(value)
  return value
}

function formatMoneyDetail(value: TransactionDetailValue) {
  return typeof value === "number" ? formatCurrency(value) : value
}

function getDetail(transaction: Transaction, key: string) {
  return transaction.details?.[key]
}

function getActivityTypeLabel(transaction: Transaction) {
  if (transaction.type === "accounts_updated") {
    const subtype = getDetail(transaction, "subtype")

    if (subtype === "account_created") return "Rekening toegevoegd"
    if (subtype === "account_deleted") return "Rekening verwijderd"

    return "Rekening bijgewerkt"
  }

  return transaction.title
}

function formatFrequency(value: TransactionDetailValue) {
  if (value === "weekly") return "Wekelijks"
  if (value === "monthly") return "Maandelijks"

  return value
}

function formatScheduleDay(
  frequency: TransactionDetailValue,
  value: TransactionDetailValue
) {
  if (typeof value !== "number") return value

  if (frequency === "weekly") {
    const days = [
      "Maandag",
      "Dinsdag",
      "Woensdag",
      "Donderdag",
      "Vrijdag",
      "Zaterdag",
      "Zondag",
    ]

    return days[value - 1] ?? value
  }

  return `Dag ${value} van de maand`
}

function getCommonRows(transaction: Transaction) {
  return [
    ["ID", transaction.id],
    ["Type", getActivityTypeLabel(transaction)],
    ["Datum", formatDateTime(transaction.createdAt)],
  ] satisfies Array<[string, TransactionDetailValue]>
}

function getTransactionDetailRows(transaction: Transaction) {
  const details = transaction.details ?? {}

  if (transaction.type === "jar_created") {
    return [
      ...getCommonRows(transaction),
      ["Naam spaarpot", details.naamSpaarpot ?? transaction.jarName],
      [
        "Beginsaldo spaarpot",
        formatMoneyDetail(details.beginsaldoSpaarpot ?? details.bedrag),
      ],
      [
        "Doel bedrag spaarpot",
        formatMoneyDetail(details.doelBedragSpaarpot ?? details.spaardoel),
      ],
      ["Doeldatum spaarpot", details.doeldatumSpaarpot ?? details.doeldatum],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (
    transaction.type === "money_distributed" ||
    transaction.type === "money_moved"
  ) {
    return [
      ...getCommonRows(transaction),
      ["Bedrag", formatMoneyDetail(transaction.amount)],
      ["Van", details.bron],
      ["Saldo van voor transactie", formatMoneyDetail(details.bronSaldoVoor)],
      ["Saldo van na transactie", formatMoneyDetail(details.bronSaldoNa)],
      ["Naar", details.doel],
      ["Saldo naar voor transactie", formatMoneyDetail(details.doelSaldoVoor)],
      ["Saldo naar na transactie", formatMoneyDetail(details.doelSaldoNa)],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "rule_created") {
    const frequency = details.frequentie

    return [
      ...getCommonRows(transaction),
      ["Frequentie", formatFrequency(frequency)],
      [
        frequency === "weekly" ? "Dag van de week" : "Dag van de maand",
        formatScheduleDay(frequency, details.schemaDag),
      ],
      ["Naam automatisering", details.naam],
      ["Bedrag automatisering", formatMoneyDetail(details.bedrag)],
      ["Spaarpot", details.spaarpot ?? transaction.jarName],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "accounts_updated") {
    const isCreated = details.subtype === "account_created"
    const isDeleted = details.subtype === "account_deleted"

    if (isCreated) {
      return [
        ["Naam rekening", details.naamRekening],
        ["Beginsaldo rekening", formatMoneyDetail(details.beginsaldoRekening)],
        ...getCommonRows(transaction),
      ] satisfies Array<[string, TransactionDetailValue]>
    }

    if (isDeleted) {
      return [
        ...getCommonRows(transaction),
        ["Naam rekening", details.naamRekening],
        ["ID rekening", details.rekeningId],
        [
          "Saldo rekening bij verwijderen",
          formatMoneyDetail(details.saldoRekeningBijVerwijderen),
        ],
        ["Totaal saldo voor", formatMoneyDetail(details.saldoVoor)],
        ["Totaal saldo na", formatMoneyDetail(details.saldoNa)],
        [
          "Bedrag toegevoegd of verwijderd",
          formatMoneyDetail(details.bedragToegevoegdOfVerwijderd),
        ],
      ] satisfies Array<[string, TransactionDetailValue]>
    }

    return [
      ...getCommonRows(transaction),
      ["Saldo voor", formatMoneyDetail(details.saldoVoor)],
      ["Saldo na", formatMoneyDetail(details.saldoNa)],
      [
        "Bedrag toegevoegd of verwijderd",
        formatMoneyDetail(details.bedragToegevoegdOfVerwijderd),
      ],
      ["Naam rekening", details.naamRekening],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "rule_deleted") {
    const frequency = details.frequentie

    return [
      ...getCommonRows(transaction),
      ["Naam automatisering", details.naam],
      ["ID automatisering", details.regelId],
      ["Bedrag automatisering", formatMoneyDetail(details.bedrag)],
      ["Spaarpot", details.spaarpot ?? transaction.jarName],
      ["Frequentie", formatFrequency(frequency)],
      [
        frequency === "weekly" ? "Dag van de week" : "Dag van de maand",
        formatScheduleDay(frequency, details.schemaDag),
      ],
      ["Was actief", details.actief],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "rule_updated" || transaction.type === "rule_run") {
    const frequency = details.frequentie

    return [
      ...getCommonRows(transaction),
      ["Naam automatisering", details.naam ?? details.regel],
      ["Bedrag", formatMoneyDetail(details.bedrag ?? transaction.amount)],
      ["Spaarpot", details.spaarpot ?? transaction.jarName],
      ["Frequentie", formatFrequency(frequency)],
      [
        frequency === "weekly" ? "Dag van de week" : "Dag van de maand",
        formatScheduleDay(frequency, details.schemaDag),
      ],
      ["Saldo voor", formatMoneyDetail(details.saldoVoor)],
      ["Saldo na", formatMoneyDetail(details.saldoNa)],
      ["Actief", details.actief],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "jar_deleted") {
    return [
      ...getCommonRows(transaction),
      ["Naam spaarpot", details.naam ?? transaction.jarName],
      ["ID spaarpot", details.spaarpotId],
      [
        "Saldo bij verwijderen",
        formatMoneyDetail(details.saldoBijVerwijderen ?? transaction.amount),
      ],
      [
        "Bedrag terug naar Nog te verdelen",
        formatMoneyDetail(details.bedragTerugNaarVrij ?? transaction.amount),
      ],
      ["Spaardoel", formatMoneyDetail(details.spaardoel)],
      ["Doeldatum", details.doeldatum],
      ["Gekoppelde automatiseringen", details.gekoppeldeAutomatiseringen],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  if (transaction.type === "jar_updated") {
    return [
      ...getCommonRows(transaction),
      ["Naam spaarpot", details.naam ?? transaction.jarName],
      ["Saldo voor", formatMoneyDetail(details.saldoVoor)],
      ["Saldo na", formatMoneyDetail(details.saldoNa)],
      ["Bedrag", formatMoneyDetail(transaction.amount)],
      ["Spaardoel", formatMoneyDetail(details.spaardoel)],
      ["Doeldatum", details.doeldatum],
    ] satisfies Array<[string, TransactionDetailValue]>
  }

  return [
    ...getCommonRows(transaction),
    ...Object.entries(details),
  ] satisfies Array<[string, TransactionDetailValue]>
}

export function ActivitySection({
  onCreateJar,
  preview = false,
  transactions,
}: ActivitySectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filterGroup, setFilterGroup] = useState<FilterGroup>("alles")
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)

  const filteredTransactions =
    filterGroup === "alles"
      ? transactions
      : transactions.filter((t) =>
          filterGroups[filterGroup].types.includes(t.type)
        )

  const visibleTransactions = preview
    ? filteredTransactions.slice(0, 4)
    : filteredTransactions.slice(0, visibleCount)

  const hasMore = !preview && visibleCount < filteredTransactions.length

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium tracking-normal">Activiteit</h2>
          <p className="text-sm text-muted-foreground">
            Geldstromen, wijzigingen en automatische acties in volgorde.
          </p>
        </div>
        {!preview && transactions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Activiteit filteren"
                size="sm"
                variant="outline"
              >
                <Filter className="size-4" aria-hidden="true" />
                {filterGroup !== "alles" ? (
                  <span>{filterGroups[filterGroup].label}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={filterGroup}
                onValueChange={(v) => {
                  setFilterGroup(v as FilterGroup)
                  setVisibleCount(PAGE_SIZE)
                }}
              >
                {(Object.keys(filterGroups) as FilterGroup[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {filterGroups[key].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <Card className="border border-border/60 shadow-sm">
        {visibleTransactions.length > 0 ? (
          <CardContent className="grid gap-1">
            {visibleTransactions.map((transaction) => {
              const Icon = transactionIcons[transaction.type] ?? Activity

              return (
                <button
                  className="flex w-full items-center justify-between rounded-2xl px-1 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  type="button"
                >
                  <span className="flex min-w-0 gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {transaction.title}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {transaction.description}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2 pl-3">
                    <Badge className="max-[420px]:hidden" variant="outline">
                      {transactionLabels[transaction.type]}
                    </Badge>
                    {transaction.amount ? (
                      <Badge variant="secondary">
                        {formatCurrency(transaction.amount)}
                      </Badge>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </CardContent>
        ) : (
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Activity className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>
              {filterGroup !== "alles" ? "Geen resultaten" : "Geen activiteit"}
            </CardTitle>
            <CardDescription>
              {filterGroup !== "alles"
                ? `Geen ${filterGroups[filterGroup].label.toLowerCase()} gevonden.`
                : "Verdelingen, potwijzigingen en automatiseringen verschijnen hier."}
            </CardDescription>
            {onCreateJar && filterGroup === "alles" ? (
              <div className="pt-2">
                <Button onClick={onCreateJar} variant="outline">
                  <CirclePlus data-icon="inline-start" />
                  Nieuwe spaarpot
                </Button>
              </div>
            ) : null}
          </CardHeader>
        )}
      </Card>

      {hasMore ? (
        <Button
          className="self-start"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          variant="outline"
        >
          Meer laden ({filteredTransactions.length - visibleCount} resterend)
        </Button>
      ) : null}

      <Dialog
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null)
        }}
      >
        <DialogContent className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction?.title ?? "Activiteit"}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description ??
                "Alle details van deze activiteit."}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {transactionLabels[selectedTransaction.type]}
                </Badge>
                {selectedTransaction.amount ? (
                  <Badge variant="secondary">
                    {formatCurrency(selectedTransaction.amount)}
                  </Badge>
                ) : null}
              </div>
              <Separator />
              <div className="grid gap-2">
                {getTransactionDetailRows(selectedTransaction).map(
                  ([label, value]) => (
                    <div
                      className="grid gap-1 rounded-2xl bg-muted px-3 py-2 text-sm sm:grid-cols-[10rem_1fr]"
                      key={label}
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium break-words">
                        {formatDetailValue(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
