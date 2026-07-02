"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AccountBalanceDialog } from "@/features/dashboard/account-balance-dialog"
import { DashboardHeader } from "@/features/dashboard/dashboard-header"
import {
  DashboardSidebar,
  type WallieView,
} from "@/features/dashboard/dashboard-sidebar"
import { EditSavingsJarDialog } from "@/features/dashboard/edit-savings-jar-dialog"
import { EditSavingsRuleDialog } from "@/features/dashboard/edit-savings-rule-dialog"
import { formatCurrency } from "@/features/dashboard/formatters"
import { MobileBottomNav } from "@/features/dashboard/mobile-bottom-nav"
import { MoveMoneySheet } from "@/features/dashboard/move-money-sheet"
import { NewSavingsJarDialog } from "@/features/dashboard/new-savings-jar-dialog"
import { NewSavingsRuleDialog } from "@/features/dashboard/new-savings-rule-dialog"
import { SavingsJarDetailSheet } from "@/features/dashboard/savings-jar-detail-sheet"
import { SettingsDialog } from "@/features/dashboard/settings-dialog"
import {
  WallieAppProvider,
  type InitialSavingsJar,
  type InitialSavingsRule,
  type InitialTransaction,
  useWallieApp,
} from "@/features/dashboard/wallie-app-provider"
import type { SavingsAccount } from "@/types/savings-account"

const pageCopy: Record<
  WallieView,
  {
    title: string
    description: string
  }
> = {
  dashboard: {
    title: "Dashboard",
    description: "Je spaargeld, doelen en acties in een rustig overzicht.",
  },
  analytics: {
    title: "Analytics",
    description: "Ontdek hoe je spaargeld verdeeld is en groeit over tijd.",
  },
  jars: {
    title: "Spaarpotten",
    description: "Beheer je potten en open details voor acties en activiteit.",
  },
  rules: {
    title: "Automatisch sparen",
    description: "Automatiseer terugkerende verdelingen naar je doelen.",
  },
  activity: {
    title: "Activiteit",
    description: "Bekijk en open elke wijziging in je geldstromen.",
  },
  settings: {
    title: "Instellingen",
    description: "Importeer, exporteer, reset of wis lokale Wallie-data.",
  },
}

function getViewFromPathname(pathname: string): WallieView {
  if (pathname.startsWith("/analytics")) {
    return "analytics"
  }

  if (pathname.startsWith("/jars")) {
    return "jars"
  }

  if (pathname.startsWith("/rules")) {
    return "rules"
  }

  if (pathname.startsWith("/activity")) {
    return "activity"
  }

  if (pathname.startsWith("/settings")) {
    return "settings"
  }

  return "dashboard"
}

function WallieAppShellContent({
  children,
  loadError,
  userEmail,
}: {
  children: ReactNode
  loadError?: boolean
  userEmail?: string
}) {
  const pathname = usePathname()
  const activeView = getViewFromPathname(pathname)
  const currentPage = pageCopy[activeView]
  const {
    dashboardState,
    accounts,
    isDemoMode,
    isAccountDialogOpen,
    isCreateDialogOpen,
    isMoveMoneySheetOpen,
    isRuleDialogOpen,
    isSettingsDialogOpen,
    jarToDelete,
    jarToEdit,
    jars,
    moveMoney,
    moveTargetJarId,
    openMoveMoneyForJar,
    ruleToDelete,
    ruleToEdit,
    rules,
    selectedJar,
    totalSaved,
    transactions,
    unassignedSavings,
    clearData,
    createJar,
    createRule,
    deleteJar,
    deleteRule,
    importData,
    setAccounts,
    setDetailJarId,
    setIsAccountDialogOpen,
    setIsCreateDialogOpen,
    setIsMoveMoneySheetOpen,
    setIsRuleDialogOpen,
    setIsSettingsDialogOpen,
    setJarToDelete,
    setJarToEdit,
    setMoveTargetJarId,
    setRuleToDelete,
    setRuleToEdit,
    updateJar,
    updateRule,
  } = useWallieApp()
  const canMoveMoney = jars.length > 0 && totalSaved + unassignedSavings > 0

  return (
    <SidebarProvider>
      <DashboardSidebar
        activeView={activeView}
        totalSaved={totalSaved}
        unassignedSavings={unassignedSavings}
        userEmail={userEmail}
      />
      <SidebarInset>
        <main className="min-h-svh bg-background pb-24 md:pb-0" id="dashboard">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:gap-8 sm:px-6 sm:py-5 lg:px-8">
            <DashboardHeader
              activeView={activeView}
              canMoveMoney={canMoveMoney}
              description={currentPage.description}
              onCreateJar={() => setIsCreateDialogOpen(true)}
              onCreateRule={() => setIsRuleDialogOpen(true)}
              onManageAccounts={() => setIsAccountDialogOpen(true)}
              onMoveMoney={() => setIsMoveMoneySheetOpen(true)}
              title={currentPage.title}
            />

            {loadError ? (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <TriangleAlert
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">
                    Je gegevens konden niet volledig geladen worden
                  </p>
                  <p className="text-destructive/80">
                    Er ging iets mis bij het ophalen van je rekeningen,
                    spaarpotten of activiteit. Ververs de pagina om het opnieuw
                    te proberen.
                  </p>
                </div>
              </div>
            ) : null}

            {children}

            <NewSavingsJarDialog
              onCreateJar={createJar}
              onOpenChange={setIsCreateDialogOpen}
              open={isCreateDialogOpen}
              availableAmount={unassignedSavings}
            />
            <AccountBalanceDialog
              accounts={accounts}
              key={
                isAccountDialogOpen
                  ? accounts
                      .map((account) => `${account.id}-${account.balance}`)
                      .join("-")
                  : "accounts-closed"
              }
              onOpenChange={setIsAccountDialogOpen}
              onSaveAccounts={setAccounts}
              open={isAccountDialogOpen}
              totalAssigned={totalSaved}
            />
            <MoveMoneySheet
              jars={jars}
              key={moveTargetJarId ?? "all-jars"}
              onMoveMoney={moveMoney}
              onOpenChange={(open) => {
                setIsMoveMoneySheetOpen(open)

                if (!open) {
                  setMoveTargetJarId(null)
                }
              }}
              open={isMoveMoneySheetOpen}
              preferredTargetId={moveTargetJarId ?? undefined}
              unassignedAmount={unassignedSavings}
            />
            <NewSavingsRuleDialog
              jars={jars}
              onCreateRule={createRule}
              onOpenChange={setIsRuleDialogOpen}
              open={isRuleDialogOpen}
            />
            <SettingsDialog
              isDemoMode={isDemoMode}
              onClearData={clearData}
              onImportData={importData}
              onOpenChange={setIsSettingsDialogOpen}
              open={isSettingsDialogOpen}
              state={dashboardState}
            />
            <SavingsJarDetailSheet
              jar={selectedJar}
              onDelete={setJarToDelete}
              onEdit={setJarToEdit}
              onMoveMoney={openMoveMoneyForJar}
              onOpenChange={(open) => {
                if (!open) {
                  setDetailJarId(null)
                }
              }}
              open={Boolean(selectedJar)}
              rules={rules}
              transactions={transactions}
            />
            {jarToEdit ? (
              <EditSavingsJarDialog
                jar={jarToEdit}
                key={jarToEdit.id}
                maxBalance={jarToEdit.balance + unassignedSavings}
                onOpenChange={(open) => {
                  if (!open) {
                    setJarToEdit(null)
                  }
                }}
                onUpdateJar={updateJar}
                open={Boolean(jarToEdit)}
              />
            ) : null}
            {ruleToEdit ? (
              <EditSavingsRuleDialog
                jars={jars}
                key={ruleToEdit.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setRuleToEdit(null)
                  }
                }}
                onUpdateRule={updateRule}
                open={Boolean(ruleToEdit)}
                rule={ruleToEdit}
              />
            ) : null}
            <AlertDialog
              open={Boolean(ruleToDelete)}
              onOpenChange={(open) => {
                if (!open) {
                  setRuleToDelete(null)
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Automatisering verwijderen?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {ruleToDelete
                      ? `Weet je het zeker? "${ruleToDelete.name}" wordt verwijderd.`
                      : "Weet je het zeker? Deze automatisering wordt verwijderd."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (ruleToDelete) {
                        deleteRule(ruleToDelete.id)
                        setRuleToDelete(null)
                      }
                    }}
                    variant="destructive"
                  >
                    Verwijderen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
              open={Boolean(jarToDelete)}
              onOpenChange={(open) => {
                if (!open) {
                  setJarToDelete(null)
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Spaarpot verwijderen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {jarToDelete
                      ? `${jarToDelete.name} wordt verwijderd. Het saldo van ${formatCurrency(
                          jarToDelete.balance
                        )} gaat terug naar Nog te verdelen.`
                      : "Deze spaarpot wordt verwijderd."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteJar} variant="destructive">
                    Verwijderen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </SidebarInset>
      <MobileBottomNav activeView={activeView} />
    </SidebarProvider>
  )
}

export function WallieAppShell({
  children,
  initialAccounts,
  initialJars,
  initialRules,
  initialTransactions,
  loadError,
  syncEnabled = true,
  userEmail,
  userId,
}: {
  children: ReactNode
  initialAccounts?: SavingsAccount[]
  initialJars?: InitialSavingsJar[]
  initialRules?: InitialSavingsRule[]
  initialTransactions?: InitialTransaction[]
  loadError?: boolean
  syncEnabled?: boolean
  userEmail?: string
  userId: string
}) {
  return (
    <WallieAppProvider
      initialAccounts={initialAccounts}
      initialJars={initialJars}
      initialRules={initialRules}
      initialTransactions={initialTransactions}
      syncEnabled={syncEnabled}
      userId={userId}
    >
      <WallieAppShellContent loadError={loadError} userEmail={userEmail}>
        {children}
      </WallieAppShellContent>
    </WallieAppProvider>
  )
}
