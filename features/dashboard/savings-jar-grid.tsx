"use client"

import { useState } from "react"
import { ArrowUpDown, PiggyBank, Plus, WalletCards } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProgress } from "@/features/dashboard/formatters"
import { SavingsJarCard } from "@/features/dashboard/savings-jar-card"
import type { SavingsJar } from "@/types/savings-jar"

type SortKey = "aangemaakt" | "naam" | "saldo" | "voortgang"

const sortLabels: Record<SortKey, string> = {
  aangemaakt: "Aangemaakt",
  naam: "Naam (A-Z)",
  saldo: "Saldo hoog-laag",
  voortgang: "Voortgang hoog-laag",
}

function sortJars(jars: SavingsJar[], key: SortKey): SavingsJar[] {
  const copy = [...jars]

  switch (key) {
    case "naam":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "nl"))
    case "saldo":
      return copy.sort((a, b) => b.balance - a.balance)
    case "voortgang":
      return copy.sort(
        (a, b) =>
          getProgress(b.balance, b.goal) - getProgress(a.balance, a.goal)
      )
    default:
      return copy
  }
}

type SavingsJarGridProps = {
  jars: SavingsJar[]
  totalAvailable: number
  onCreateJar: () => void
  onManageAccounts: () => void
  onOpenJar: (jar: SavingsJar) => void
  preview?: boolean
}

const PREVIEW_COUNT = 4

export function SavingsJarGrid({
  jars,
  onCreateJar,
  onManageAccounts,
  onOpenJar,
  preview = false,
  totalAvailable,
}: SavingsJarGridProps) {
  const [sortKey, setSortKey] = useState<SortKey>("aangemaakt")
  const sortedJars = sortJars(jars, preview ? "voortgang" : sortKey)
  const visibleJars = preview ? sortedJars.slice(0, PREVIEW_COUNT) : sortedJars

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-normal">Spaarpotten</h2>
          <p className="text-sm text-muted-foreground">
            Verdeel je spaargeld over doelen die bij je plannen passen.
          </p>
        </div>
        {!preview ? (
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {jars.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    <span className="hidden min-[380px]:inline">
                      {sortLabels[sortKey]}
                    </span>
                    <span className="min-[380px]:hidden">Sorteer</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={sortKey}
                    onValueChange={(value) => setSortKey(value as SortKey)}
                  >
                    {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {sortLabels[key]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {jars.length > 0 ? (
              <Badge variant="outline">
                {jars.length} {jars.length === 1 ? "pot" : "potten"}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {visibleJars.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {visibleJars.map((jar) => (
            <SavingsJarCard jar={jar} key={jar.id} onOpenDetail={onOpenJar} />
          ))}
        </div>
      ) : (
        <Card className="border border-dashed border-border/80 bg-muted/25 shadow-none">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-background text-muted-foreground ring-1 ring-border">
              <PiggyBank className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Nog geen spaarpotten</CardTitle>
            <CardDescription>
              {totalAvailable > 0
                ? "Maak je eerste pot voor een doel dat je apart wilt zetten."
                : "Vul je rekeningen in en maak daarna je eerste pot."}
            </CardDescription>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button onClick={onCreateJar}>
                <Plus data-icon="inline-start" />
                Nieuwe spaarpot
              </Button>
              <Button onClick={onManageAccounts} variant="outline">
                <WalletCards data-icon="inline-start" />
                Rekeningen
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
    </section>
  )
}
