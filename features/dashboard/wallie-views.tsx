"use client"

import Link from "next/link"
import {
  ArrowRight,
  Download,
  Monitor,
  Moon,
  Settings,
  Sun,
  WalletCards,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AccountsOverviewCard } from "@/features/dashboard/accounts-overview-card"
import { ActivitySection } from "@/features/dashboard/activity-section"
import { AnalyticsSection } from "@/features/dashboard/analytics-section"
import { DashboardHero } from "@/features/dashboard/dashboard-hero"
import { DeleteAccountButton } from "@/features/dashboard/delete-account-button"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { OnboardingBanner } from "@/features/dashboard/onboarding-banner"
import { SavingsJarGrid } from "@/features/dashboard/savings-jar-grid"
import { SavingsRulesSection } from "@/features/dashboard/savings-rules-section"
import { UnassignedSavingsCard } from "@/features/dashboard/unassigned-savings-card"
import { useWallieApp } from "@/features/dashboard/wallie-app-provider"

export function DashboardView() {
  const {
    accounts,
    jars,
    rules,
    totalAvailable,
    totalGoal,
    totalSaved,
    transactions,
    unassignedSavings,
    runRule,
    setDetailJarId,
    setIsAccountDialogOpen,
    setIsCreateDialogOpen,
    setIsMoveMoneySheetOpen,
    setIsRuleDialogOpen,
    setRuleToDelete,
    setRuleToEdit,
    toggleRule,
  } = useWallieApp()

  return (
    <>
      <OnboardingBanner
        hasAccounts={accounts.length > 0 && totalAvailable > 0}
        hasJars={jars.length > 0}
        hasDistributed={unassignedSavings === 0 && totalSaved > 0}
        onAddAccounts={() => setIsAccountDialogOpen(true)}
        onCreateJar={() => setIsCreateDialogOpen(true)}
        onMoveMoney={() => setIsMoveMoneySheetOpen(true)}
      />

      <DashboardHero
        activeJarCount={jars.length}
        totalAvailable={totalAvailable}
        totalGoal={totalGoal}
        totalSaved={totalSaved}
        unassignedSavings={unassignedSavings}
      />

      <div id="jars" className="flex flex-col gap-4">
        <SavingsJarGrid
          jars={jars}
          onCreateJar={() => setIsCreateDialogOpen(true)}
          onManageAccounts={() => setIsAccountDialogOpen(true)}
          onOpenJar={(jar) => setDetailJarId(jar.id)}
          preview
          totalAvailable={totalAvailable}
        />
        {jars.length > 4 ? (
          <Link
            className="flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
            href="/jars"
          >
            Alle spaarpotten bekijken
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div id="activity" className="flex flex-col gap-4">
        <ActivitySection
          onCreateJar={() => setIsCreateDialogOpen(true)}
          preview
          transactions={transactions}
        />
        {transactions.length > 4 ? (
          <Link
            className="flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
            href="/activity"
          >
            Alle activiteit bekijken
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div id="rules" className="flex flex-col gap-4">
        <SavingsRulesSection
          jars={jars}
          onCreateJar={() => setIsCreateDialogOpen(true)}
          onCreateRule={() => setIsRuleDialogOpen(true)}
          onDeleteRule={setRuleToDelete}
          onEditRule={setRuleToEdit}
          onRunRule={runRule}
          onToggleRule={toggleRule}
          rules={rules}
          unassignedSavings={unassignedSavings}
        />
        {rules.length > 3 ? (
          <Link
            className="flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
            href="/rules"
          >
            Alle automatiseringen bekijken
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </>
  )
}

export function AnalyticsView() {
  const {
    jars,
    setIsAccountDialogOpen,
    setIsCreateDialogOpen,
    totalSaved,
    transactions,
  } = useWallieApp()

  return (
    <div id="analytics">
      <AnalyticsSection
        jars={jars}
        onCreateJar={() => setIsCreateDialogOpen(true)}
        onManageAccounts={() => setIsAccountDialogOpen(true)}
        totalSaved={totalSaved}
        transactions={transactions}
      />
    </div>
  )
}

export function JarsView() {
  const {
    jars,
    setDetailJarId,
    setIsAccountDialogOpen,
    setIsCreateDialogOpen,
    setIsMoveMoneySheetOpen,
    totalAvailable,
    unassignedSavings,
  } = useWallieApp()

  return (
    <>
      <UnassignedSavingsCard
        amount={unassignedSavings}
        onDistribute={() => setIsMoveMoneySheetOpen(true)}
      />

      <div id="jars">
        <SavingsJarGrid
          jars={jars}
          onCreateJar={() => setIsCreateDialogOpen(true)}
          onManageAccounts={() => setIsAccountDialogOpen(true)}
          onOpenJar={(jar) => setDetailJarId(jar.id)}
          totalAvailable={totalAvailable}
        />
      </div>
    </>
  )
}

export function RulesView() {
  const {
    jars,
    rules,
    unassignedSavings,
    runRule,
    setIsCreateDialogOpen,
    setIsRuleDialogOpen,
    setRuleToDelete,
    setRuleToEdit,
    toggleRule,
  } = useWallieApp()

  return (
    <div id="rules">
      <SavingsRulesSection
        jars={jars}
        onCreateJar={() => setIsCreateDialogOpen(true)}
        onCreateRule={() => setIsRuleDialogOpen(true)}
        onDeleteRule={setRuleToDelete}
        onEditRule={setRuleToEdit}
        onRunRule={runRule}
        onToggleRule={toggleRule}
        rules={rules}
        showAll
        unassignedSavings={unassignedSavings}
      />
    </div>
  )
}

export function ActivityView() {
  const { setIsCreateDialogOpen, transactions } = useWallieApp()

  return (
    <div id="activity">
      <ActivitySection
        onCreateJar={() => setIsCreateDialogOpen(true)}
        transactions={transactions}
      />
    </div>
  )
}

const themeOptions = [
  { value: "light", label: "Licht", icon: Sun },
  { value: "dark", label: "Donker", icon: Moon },
  { value: "system", label: "Systeem", icon: Monitor },
] as const

export function SettingsView() {
  const {
    accounts,
    isDemoMode,
    setIsAccountDialogOpen,
    setIsSettingsDialogOpen,
    totalAvailable,
    unassignedSavings,
  } = useWallieApp()
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AccountsOverviewCard
        accounts={accounts}
        onManageAccounts={() => setIsAccountDialogOpen(true)}
        totalAvailable={totalAvailable}
        unassignedSavings={unassignedSavings}
      />
      <div className="flex flex-col gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Settings className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>{isDemoMode ? "Demo-data" : "Accountdata"}</CardTitle>
            <CardDescription>
              {isDemoMode
                ? "Exporteer, importeer of wis de demo-data op dit apparaat."
                : "Exporteer, importeer of wis je Wallie-accountdata."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button onClick={() => setIsSettingsDialogOpen(true)}>
              <Download data-icon="inline-start" />
              Import/export openen
            </Button>
            <Button
              onClick={() => setIsAccountDialogOpen(true)}
              variant="outline"
            >
              <WalletCards data-icon="inline-start" />
              Rekeningen beheren
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Sun className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Weergave</CardTitle>
            <CardDescription>
              Kies een licht, donker of automatisch thema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              className="w-full"
              onValueChange={(value) => {
                if (value) {
                  setTheme(value)
                }
              }}
              spacing={0}
              type="single"
              value={theme}
              variant="outline"
            >
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  aria-label={label}
                  className="flex-1 gap-1.5"
                  key={value}
                  value={value}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              {isDemoMode
                ? "In demo-modus kun je alleen lokale demo-data beheren."
                : "Log uit op dit apparaat of verwijder je Wallie-account permanent."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <SignOutButton className="w-full justify-start" />
            <DeleteAccountButton
              className="w-full justify-start"
              disabled={isDemoMode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
