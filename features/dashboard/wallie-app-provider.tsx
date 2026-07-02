"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { toast } from "@/components/ui/sonner"
import {
  clearDashboardState,
  emptyDashboardState,
  loadDashboardState,
  saveDashboardState,
  type DashboardState,
} from "@/features/dashboard/dashboard-storage"
import { formatCurrency } from "@/features/dashboard/formatters"
import { getIconOption } from "@/features/dashboard/jar-options"
import { unassignedSourceId } from "@/features/dashboard/move-money-sheet"
import { savingsJarColors } from "@/features/dashboard/savings-jars"
import { createClient } from "@/lib/supabase/client"
import type { Json } from "@/types/database"
import type { SavingsAccount } from "@/types/savings-account"
import type { SavingsJar, SavingsJarColor } from "@/types/savings-jar"
import type { SavingsRule, SavingsRuleFrequency } from "@/types/savings-rule"
import type {
  Transaction,
  TransactionDetailValue,
  TransactionType,
} from "@/types/transaction"

type WallieAppContextValue = {
  dashboardState: DashboardState
  accounts: DashboardState["accounts"]
  detailJarId: string | null
  isAccountDialogOpen: boolean
  isCreateDialogOpen: boolean
  isMoveMoneySheetOpen: boolean
  isRuleDialogOpen: boolean
  isSettingsDialogOpen: boolean
  jarToDelete: SavingsJar | null
  jarToEdit: SavingsJar | null
  jars: SavingsJar[]
  moveTargetJarId: string | null
  ruleToEdit: SavingsRule | null
  ruleToDelete: SavingsRule | null
  rules: SavingsRule[]
  selectedJar: SavingsJar | null
  totalAvailable: number
  totalGoal: number
  totalSaved: number
  transactions: Transaction[]
  unassignedSavings: number
  isDemoMode: boolean
  clearData: () => void
  createJar: (jar: SavingsJar) => Promise<boolean>
  createRule: (rule: SavingsRule) => Promise<boolean>
  deleteJar: () => void
  deleteRule: (ruleId: string) => void
  importData: (importedState: DashboardState) => void
  moveMoney: (sourceId: string, targetId: string, amount: number) => void
  openMoveMoneyForJar: (jar: SavingsJar) => void
  runRule: (ruleId: string) => void
  setRuleToEdit: (rule: SavingsRule | null) => void
  setRuleToDelete: (ruleId: string | null) => void
  updateRule: (rule: SavingsRule) => Promise<boolean>
  setAccounts: (accounts: DashboardState["accounts"]) => Promise<boolean>
  setDetailJarId: (jarId: string | null) => void
  setIsAccountDialogOpen: (open: boolean) => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsMoveMoneySheetOpen: (open: boolean) => void
  setIsRuleDialogOpen: (open: boolean) => void
  setIsSettingsDialogOpen: (open: boolean) => void
  setJarToDelete: (jar: SavingsJar | null) => void
  setJarToEdit: (jar: SavingsJar | null) => void
  setMoveTargetJarId: (jarId: string | null) => void
  toggleRule: (ruleId: string, active: boolean) => void
  updateJar: (updatedJar: SavingsJar) => Promise<boolean>
}

const WallieAppContext = createContext<WallieAppContextValue | null>(null)

export type InitialSavingsJar = {
  id: string
  name: string
  colorName: string
  iconName: string
  balance: number
  goal?: number
  targetDate?: string
}

export type InitialTransaction = {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  amount?: number
  jarId?: string
  metadata: Json
}

export type InitialSavingsRule = {
  id: string
  name: string
  amount: number
  frequency: SavingsRuleFrequency
  scheduleDay: number
  jarId: string
  active: boolean
}

function createTransaction(
  transaction: Omit<Transaction, "createdAt" | "id">
): Transaction {
  return {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
}

function prependCreatedTransaction(
  transactions: Transaction[],
  transaction: Transaction
) {
  return [transaction, ...transactions].slice(0, 50)
}

function getAccountLabel(jarId: string, currentJars: SavingsJar[]) {
  if (jarId === unassignedSourceId) {
    return "Nog te verdelen"
  }

  return currentJars.find((jar) => jar.id === jarId)?.name ?? "een spaarpot"
}

function getTotalAssigned(jars: SavingsJar[]) {
  return jars.reduce((total, jar) => total + jar.balance, 0)
}

function getTotalAccountBalance(accounts: SavingsAccount[]) {
  return accounts.reduce((total, account) => total + account.balance, 0)
}

function getTotalAvailable(state: DashboardState) {
  if (state.accounts.length > 0) {
    return state.accounts.reduce((total, account) => total + account.balance, 0)
  }

  return getTotalAssigned(state.jars) + state.unassignedSavings
}

function getNextUnassignedSavings(state: DashboardState, jars: SavingsJar[]) {
  return Math.max(getTotalAvailable(state) - getTotalAssigned(jars), 0)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function createAccountId() {
  return crypto.randomUUID()
}

function normalizeAccounts(accounts: SavingsAccount[]) {
  return accounts
    .map((account) => ({
      ...account,
      id: isUuid(account.id) ? account.id : createAccountId(),
      balance: Math.max(0, Number(account.balance) || 0),
      name: account.name.trim() || "Rekening",
    }))
    .filter((account) => account.balance > 0 || account.name)
}

function getSavingsJarColor(colorName: string): SavingsJarColor {
  return (
    savingsJarColors.find((color) => color.name === colorName) ??
    savingsJarColors[0]
  )
}

function reviveInitialJar(jar: InitialSavingsJar): SavingsJar {
  const iconOption = getIconOption(jar.iconName)

  return {
    balance: Math.max(0, Number(jar.balance) || 0),
    color: getSavingsJarColor(jar.colorName),
    goal: jar.goal,
    icon: iconOption.icon,
    iconName: iconOption.name,
    id: isUuid(jar.id) ? jar.id : createAccountId(),
    name: jar.name.trim() || "Spaarpot",
    targetDate: jar.targetDate,
  }
}

function normalizeJars(jars: SavingsJar[]) {
  return jars.map((jar) => {
    const iconOption = getIconOption(jar.iconName)
    const goalValue = Number(jar.goal) || 0

    return {
      ...jar,
      balance: Math.max(0, Number(jar.balance) || 0),
      color: getSavingsJarColor(jar.color.name),
      goal: goalValue > 0 ? goalValue : undefined,
      icon: iconOption.icon,
      iconName: iconOption.name,
      id: isUuid(jar.id) ? jar.id : createAccountId(),
      name: jar.name.trim() || "Spaarpot",
      targetDate: jar.targetDate || undefined,
    }
  })
}

function normalizeRule(rule: SavingsRule): SavingsRule {
  const frequency = rule.frequency === "weekly" ? "weekly" : "monthly"
  const fallbackDay = frequency === "weekly" ? 1 : 1
  const scheduleDay = Number(rule.scheduleDay) || fallbackDay

  return {
    active: Boolean(rule.active),
    amount: Math.max(0, Number(rule.amount) || 0),
    frequency,
    id: isUuid(rule.id) ? rule.id : createAccountId(),
    jarId: rule.jarId,
    name: rule.name.trim() || "Automatisering",
    scheduleDay:
      frequency === "weekly"
        ? Math.min(Math.max(scheduleDay, 1), 7)
        : Math.min(Math.max(scheduleDay, 1), 31),
  }
}

function normalizeRules(rules: SavingsRule[]) {
  return rules.map(normalizeRule)
}

function normalizeDashboardStateForPersistence(state: DashboardState) {
  const jarIdMap = new Map<string, string>()
  const jars = state.jars.map((jar) => {
    const normalizedId = isUuid(jar.id) ? jar.id : createAccountId()
    const iconOption = getIconOption(jar.iconName)
    const goalValue = Number(jar.goal) || 0

    jarIdMap.set(jar.id, normalizedId)

    return {
      ...jar,
      balance: Math.max(0, Number(jar.balance) || 0),
      color: getSavingsJarColor(jar.color.name),
      goal: goalValue > 0 ? goalValue : undefined,
      icon: iconOption.icon,
      iconName: iconOption.name,
      id: normalizedId,
      name: jar.name.trim() || "Spaarpot",
      targetDate: jar.targetDate || undefined,
    }
  })
  const jarIds = new Set(jars.map((jar) => jar.id))
  const rules = state.rules
    .map((rule) =>
      normalizeRule({
        ...rule,
        jarId: jarIdMap.get(rule.jarId) ?? rule.jarId,
      })
    )
    .filter((rule) => jarIds.has(rule.jarId))
  const transactions = state.transactions.map((transaction) => ({
    ...transaction,
    id: isUuid(transaction.id) ? transaction.id : crypto.randomUUID(),
    jarId:
      transaction.jarId && jarIds.has(jarIdMap.get(transaction.jarId) ?? "")
        ? jarIdMap.get(transaction.jarId)
        : transaction.jarId && jarIds.has(transaction.jarId)
          ? transaction.jarId
          : undefined,
  }))

  return {
    ...state,
    accounts: normalizeAccounts(state.accounts),
    jars,
    rules,
    transactions,
  }
}

function toSavingsJarRow(jar: SavingsJar, userId: string) {
  return {
    balance: jar.balance,
    color: jar.color.name,
    goal: jar.goal ?? null,
    icon: jar.iconName,
    id: jar.id,
    name: jar.name,
    target_date: jar.targetDate ?? null,
    user_id: userId,
  }
}

function toSavingsRuleRow(rule: SavingsRule, userId: string) {
  return {
    active: rule.active,
    amount: rule.amount,
    frequency: rule.frequency,
    id: rule.id,
    jar_id: rule.jarId,
    name: rule.name,
    schedule_day: rule.scheduleDay,
    user_id: userId,
  }
}

function getMetadataValue(metadata: Json, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined
  }

  return metadata[key]
}

function reviveTransactionDetails(
  details: Json | undefined
): Record<string, TransactionDetailValue> | undefined {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return undefined
  }

  const entries = Object.entries(details).filter((entry) => {
    const value = entry[1]

    return (
      value == null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
  }) as Array<[string, TransactionDetailValue]>

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function toUiTransactionType(type: string, metadata: Json): TransactionType {
  const uiType = getMetadataValue(metadata, "ui_type")

  if (uiType === "money_distributed") return "money_distributed"
  if (uiType === "rule_run") return "rule_run"
  if (uiType === "rule_updated") return "rule_updated"

  if (type === "account_updated") return "accounts_updated"
  if (type === "rule_updated") return "rule_updated"

  if (
    type === "jar_created" ||
    type === "jar_deleted" ||
    type === "jar_updated" ||
    type === "money_moved" ||
    type === "rule_created" ||
    type === "rule_deleted" ||
    type === "rule_updated"
  ) {
    return type
  }

  return "money_moved"
}

function toDbTransactionType(type: TransactionType) {
  if (type === "accounts_updated") return "account_updated"
  if (type === "money_distributed") return "money_moved"
  if (type === "rule_run") return "rule_updated"

  return type
}

function reviveInitialTransaction(
  transaction: InitialTransaction
): Transaction {
  const jarName = getMetadataValue(transaction.metadata, "jar_name")
  const details = getMetadataValue(transaction.metadata, "details")

  return {
    amount: transaction.amount,
    createdAt: transaction.createdAt,
    description: transaction.description,
    details: reviveTransactionDetails(details),
    id: transaction.id,
    jarId: transaction.jarId,
    jarName: typeof jarName === "string" ? jarName : undefined,
    type: toUiTransactionType(transaction.type, transaction.metadata),
    title: transaction.title,
  }
}

type WallieAppProviderProps = {
  children: ReactNode
  initialAccounts?: SavingsAccount[]
  initialJars?: InitialSavingsJar[]
  initialRules?: InitialSavingsRule[]
  initialTransactions?: InitialTransaction[]
  syncEnabled?: boolean
  userId: string
}

export function WallieAppProvider({
  children,
  initialAccounts,
  initialJars,
  initialRules,
  initialTransactions,
  syncEnabled = true,
  userId,
}: WallieAppProviderProps) {
  const [dashboardState, setDashboardState] = useState(() => {
    const storedState = syncEnabled ? emptyDashboardState : loadDashboardState()
    const nextAccounts = initialAccounts
      ? normalizeAccounts(initialAccounts)
      : storedState.accounts
    const nextJars = initialJars
      ? initialJars.map(reviveInitialJar)
      : normalizeJars(storedState.jars)

    return {
      ...storedState,
      accounts: nextAccounts,
      jars: nextJars,
      rules: initialRules ? normalizeRules(initialRules) : storedState.rules,
      transactions: initialTransactions
        ? initialTransactions.map(reviveInitialTransaction)
        : storedState.transactions,
    }
  })
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMoveMoneySheetOpen, setIsMoveMoneySheetOpen] = useState(false)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [detailJarId, setDetailJarId] = useState<string | null>(null)
  const [moveTargetJarId, setMoveTargetJarId] = useState<string | null>(null)
  const [jarToDelete, setJarToDelete] = useState<SavingsJar | null>(null)
  const [jarToEdit, setJarToEdit] = useState<SavingsJar | null>(null)
  const [ruleToEdit, setRuleToEdit] = useState<SavingsRule | null>(null)
  const [ruleToDeleteId, setRuleToDeleteId] = useState<string | null>(null)

  const {
    accounts,
    jars,
    rules,
    transactions,
    unassignedSavings: storedUnassignedSavings,
  } = dashboardState
  const selectedJar = jars.find((jar) => jar.id === detailJarId) ?? null
  const ruleToDelete = rules.find((rule) => rule.id === ruleToDeleteId) ?? null

  const totalSaved = useMemo(() => getTotalAssigned(jars), [jars])
  const totalGoal = useMemo(
    () => jars.reduce((total, jar) => total + (jar.goal ?? 0), 0),
    [jars]
  )
  const totalAvailable = useMemo(
    () =>
      accounts.length > 0
        ? accounts.reduce((total, account) => total + account.balance, 0)
        : totalSaved + storedUnassignedSavings,
    [accounts, totalSaved, storedUnassignedSavings]
  )
  const availableToAssign = Math.max(totalAvailable - totalSaved, 0)
  const unassignedSavings = availableToAssign
  const normalizedDashboardState = useMemo(
    () => ({
      ...dashboardState,
      unassignedSavings,
    }),
    [dashboardState, unassignedSavings]
  )

  useEffect(() => {
    if (!syncEnabled) {
      saveDashboardState(normalizedDashboardState)
    }
  }, [normalizedDashboardState, syncEnabled])

  function createJar(jar: SavingsJar) {
    const [jarToCreate] = normalizeJars([jar])
    const safeJarToCreate = {
      ...jarToCreate,
      balance: Math.min(Math.max(jarToCreate.balance, 0), unassignedSavings),
    }
    const transaction = createTransaction({
      type: "jar_created",
      title: "Spaarpot aangemaakt",
      description: `${safeJarToCreate.name} is toegevoegd.`,
      amount: safeJarToCreate.balance > 0 ? safeJarToCreate.balance : undefined,
      details: {
        actie: "Spaarpot aangemaakt",
        bedrag: safeJarToCreate.balance,
        beginsaldoSpaarpot: safeJarToCreate.balance,
        doeldatum: safeJarToCreate.targetDate ?? null,
        doeldatumSpaarpot: safeJarToCreate.targetDate ?? null,
        naam: safeJarToCreate.name,
        naamSpaarpot: safeJarToCreate.name,
        doelBedragSpaarpot: safeJarToCreate.goal ?? null,
        spaardoel: safeJarToCreate.goal ?? null,
      },
      jarId: safeJarToCreate.id,
      jarName: safeJarToCreate.name,
    })

    setDashboardState((currentState) => {
      const nextJars = [safeJarToCreate, ...currentState.jars]

      return {
        ...currentState,
        jars: nextJars,
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: getNextUnassignedSavings(currentState, nextJars),
      }
    })

    return Promise.all([
      saveJarToSupabase(safeJarToCreate),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Spaarpot "${safeJarToCreate.name}" aangemaakt`)
        return true
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Spaarpot opslaan is niet gelukt"
        )
        return false
      })
  }

  function moveMoney(sourceId: string, targetId: string, amount: number) {
    const sourceBalance =
      sourceId === unassignedSourceId
        ? unassignedSavings
        : jars.find((jar) => jar.id === sourceId)?.balance
    const targetExists =
      targetId === unassignedSourceId || jars.some((jar) => jar.id === targetId)

    if (
      amount <= 0 ||
      sourceId === targetId ||
      !targetExists ||
      sourceBalance === undefined ||
      amount > sourceBalance
    ) {
      return
    }

    const sourceLabel = getAccountLabel(sourceId, jars)
    const targetLabel = getAccountLabel(targetId, jars)
    const relatedJar =
      targetId === unassignedSourceId
        ? jars.find((jar) => jar.id === sourceId)
        : jars.find((jar) => jar.id === targetId)
    const nextJars = jars.map((item) =>
      item.id === sourceId
        ? { ...item, balance: item.balance - amount }
        : item.id === targetId
          ? { ...item, balance: item.balance + amount }
          : item
    )
    const affectedJars = nextJars.filter(
      (jar) => jar.id === sourceId || jar.id === targetId
    )
    const transaction = createTransaction({
      type:
        sourceId === unassignedSourceId ? "money_distributed" : "money_moved",
      title:
        sourceId === unassignedSourceId ? "Geld verdeeld" : "Geld verplaatst",
      description: `Van ${sourceLabel} naar ${targetLabel}.`,
      amount,
      details: {
        actie:
          sourceId === unassignedSourceId ? "Geld verdeeld" : "Geld verplaatst",
        bedrag: amount,
        bron: sourceLabel,
        bronId: sourceId,
        bronSaldoVoor: sourceBalance,
        bronSaldoNa: sourceBalance - amount,
        doel: targetLabel,
        doelId: targetId,
        doelSaldoVoor:
          targetId === unassignedSourceId
            ? unassignedSavings
            : jars.find((jar) => jar.id === targetId)?.balance,
        doelSaldoNa:
          targetId === unassignedSourceId
            ? unassignedSavings + amount
            : nextJars.find((jar) => jar.id === targetId)?.balance,
      },
      jarId: relatedJar?.id,
      jarName: relatedJar?.name,
    })

    setDashboardState((currentState) => {
      return {
        ...currentState,
        jars: nextJars,
        rules: currentState.rules,
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: getNextUnassignedSavings(currentState, nextJars),
      }
    })

    void Promise.all([
      ...affectedJars.map((jar) => saveJarToSupabase(jar)),
      saveTransactionToSupabase(transaction, {
        sourceJarId: sourceId === unassignedSourceId ? null : sourceId,
        targetJarId: targetId === unassignedSourceId ? null : targetId,
      }),
    ]).catch((error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Geldverplaatsing opslaan is niet gelukt"
      )
    })

    toast.success(
      sourceId === unassignedSourceId
        ? `${formatCurrency(amount)} verdeeld naar ${getAccountLabel(targetId, jars)}`
        : `${formatCurrency(amount)} verplaatst`
    )
  }

  function updateJar(updatedJar: SavingsJar) {
    const [normalizedJar] = normalizeJars([updatedJar])
    const otherAssigned = jars.reduce(
      (total, jar) => total + (jar.id === normalizedJar.id ? 0 : jar.balance),
      0
    )
    const maxBalance = Math.max(totalAvailable - otherAssigned, 0)
    const safeJarToUpdate = {
      ...normalizedJar,
      balance: Math.min(Math.max(normalizedJar.balance, 0), maxBalance),
    }
    const currentJar = jars.find((jar) => jar.id === safeJarToUpdate.id)
    const transaction = createTransaction({
      type: "jar_updated",
      title: "Spaarpot bijgewerkt",
      description:
        currentJar && currentJar.balance !== safeJarToUpdate.balance
          ? `${safeJarToUpdate.name} is aangepast naar een saldo van ${safeJarToUpdate.balance}.`
          : `${safeJarToUpdate.name} is aangepast.`,
      details: {
        actie: "Spaarpot bijgewerkt",
        doeldatum: safeJarToUpdate.targetDate ?? null,
        icoon: safeJarToUpdate.iconName,
        kleur: safeJarToUpdate.color.name,
        naam: safeJarToUpdate.name,
        saldoNa: safeJarToUpdate.balance,
        saldoVoor: currentJar?.balance ?? null,
        spaardoel: safeJarToUpdate.goal ?? null,
      },
      jarId: safeJarToUpdate.id,
      jarName: safeJarToUpdate.name,
    })

    setDashboardState((currentState) => {
      const nextJars = currentState.jars.map((jar) =>
        jar.id === safeJarToUpdate.id ? safeJarToUpdate : jar
      )

      return {
        ...currentState,
        jars: nextJars,
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: getNextUnassignedSavings(currentState, nextJars),
      }
    })

    return Promise.all([
      saveJarToSupabase(safeJarToUpdate),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Spaarpot "${safeJarToUpdate.name}" bijgewerkt`)
        return true
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Spaarpot bijwerken is niet gelukt"
        )
        return false
      })
  }

  function deleteJar() {
    if (!jarToDelete) {
      return
    }
    const linkedRules = rules.filter((rule) => rule.jarId === jarToDelete.id)
    const transaction = createTransaction({
      type: "jar_deleted",
      title: "Spaarpot verwijderd",
      description: `${jarToDelete.name} is verwijderd. Saldo terug naar Nog te verdelen.`,
      amount: jarToDelete.balance,
      details: {
        actie: "Spaarpot verwijderd",
        bedragTerugNaarVrij: jarToDelete.balance,
        doeldatum: jarToDelete.targetDate ?? null,
        gekoppeldeAutomatiseringen: linkedRules.length,
        naam: jarToDelete.name,
        saldoBijVerwijderen: jarToDelete.balance,
        spaarpotId: jarToDelete.id,
        spaardoel: jarToDelete.goal ?? null,
      },
      jarName: jarToDelete.name,
    })

    setDashboardState((currentState) => {
      const nextJars = currentState.jars.filter(
        (jar) => jar.id !== jarToDelete.id
      )

      return {
        ...currentState,
        jars: nextJars,
        rules: currentState.rules.filter(
          (rule) => rule.jarId !== jarToDelete.id
        ),
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: getNextUnassignedSavings(currentState, nextJars),
      }
    })
    const deletedName = jarToDelete.name
    const deletedId = jarToDelete.id
    setDetailJarId((currentJarId) =>
      currentJarId === jarToDelete.id ? null : currentJarId
    )
    setMoveTargetJarId((currentJarId) =>
      currentJarId === jarToDelete.id ? null : currentJarId
    )
    setJarToDelete(null)

    void Promise.all([
      deleteJarFromSupabase(deletedId),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Spaarpot "${deletedName}" verwijderd`)
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Spaarpot verwijderen is niet gelukt"
        )
      })
  }

  function createRule(rule: SavingsRule) {
    const normalizedRule = normalizeRule(rule)
    const jar = jars.find((jar) => jar.id === normalizedRule.jarId)
    const transaction = createTransaction({
      type: "rule_created",
      title: "Automatisering aangemaakt",
      description: `${normalizedRule.name} is toegevoegd.`,
      amount: normalizedRule.amount,
      details: {
        actief: normalizedRule.active,
        actie: "Automatisering aangemaakt",
        bedrag: normalizedRule.amount,
        frequentie: normalizedRule.frequency,
        naam: normalizedRule.name,
        schemaDag: normalizedRule.scheduleDay,
        spaarpot: jar?.name ?? null,
      },
      jarId: normalizedRule.jarId,
      jarName: jar?.name,
    })

    setDashboardState((currentState) => ({
      ...currentState,
      rules: [normalizedRule, ...currentState.rules],
      transactions: prependCreatedTransaction(
        currentState.transactions,
        transaction
      ),
    }))

    return Promise.all([
      saveRuleToSupabase(normalizedRule),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Automatisering "${normalizedRule.name}" aangemaakt`)
        return true
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Automatisering opslaan is niet gelukt"
        )
        return false
      })
  }

  function toggleRule(ruleId: string, active: boolean) {
    const rule = rules.find((rule) => rule.id === ruleId)
    const nextRule = rule ? { ...rule, active } : null

    setDashboardState((currentState) => ({
      ...currentState,
      rules: currentState.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, active } : rule
      ),
    }))

    if (!nextRule) {
      return
    }

    void saveRuleToSupabase(nextRule).catch((error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Automatisering bijwerken is niet gelukt"
      )
    })
  }

  function updateRule(updatedRule: SavingsRule) {
    const normalizedRule = normalizeRule(updatedRule)
    const jar = jars.find((jar) => jar.id === normalizedRule.jarId)
    const transaction = createTransaction({
      type: "rule_updated",
      title: "Automatisering bijgewerkt",
      description: `${normalizedRule.name} is aangepast.`,
      amount: normalizedRule.amount,
      details: {
        actief: normalizedRule.active,
        actie: "Automatisering bijgewerkt",
        bedrag: normalizedRule.amount,
        frequentie: normalizedRule.frequency,
        naam: normalizedRule.name,
        schemaDag: normalizedRule.scheduleDay,
        spaarpot: jar?.name ?? null,
      },
      jarId: normalizedRule.jarId,
      jarName: jar?.name,
    })

    setDashboardState((currentState) => ({
      ...currentState,
      rules: currentState.rules.map((rule) =>
        rule.id === normalizedRule.id ? normalizedRule : rule
      ),
      transactions: prependCreatedTransaction(
        currentState.transactions,
        transaction
      ),
    }))

    return Promise.all([
      saveRuleToSupabase(normalizedRule),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Automatisering "${normalizedRule.name}" bijgewerkt`)
        return true
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Automatisering bijwerken is niet gelukt"
        )
        return false
      })
  }

  function deleteRule(ruleId: string) {
    const rule = rules.find((rule) => rule.id === ruleId)
    const ruleName = rule?.name ?? "Automatisering"
    const jar = jars.find((jar) => jar.id === rule?.jarId)
    const transaction = createTransaction({
      type: "rule_deleted",
      title: "Automatisering verwijderd",
      description: `${ruleName} is verwijderd.`,
      details: {
        actief: rule?.active ?? null,
        actie: "Automatisering verwijderd",
        bedrag: rule?.amount ?? null,
        frequentie: rule?.frequency ?? null,
        naam: ruleName,
        regelId: rule?.id ?? null,
        schemaDag: rule?.scheduleDay ?? null,
        spaarpot: jar?.name ?? null,
      },
      jarId: rule?.jarId,
      jarName: jar?.name,
    })

    setDashboardState((currentState) => ({
      ...currentState,
      transactions: prependCreatedTransaction(
        currentState.transactions,
        transaction
      ),
      rules: currentState.rules.filter((rule) => rule.id !== ruleId),
    }))

    void Promise.all([
      deleteRuleFromSupabase(ruleId),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success(`Automatisering "${ruleName}" verwijderd`)
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Automatisering verwijderen is niet gelukt"
        )
      })
  }

  function runRule(ruleId: string) {
    const rule = rules.find((item) => item.id === ruleId)
    const jar = jars.find((item) => item.id === rule?.jarId)

    if (!rule || !jar || !rule.active || rule.amount > availableToAssign) {
      return
    }
    const updatedJar = {
      ...jar,
      balance: jar.balance + rule.amount,
    }
    const nextJars = jars.map((item) =>
      item.id === rule.jarId ? updatedJar : item
    )
    const transaction = createTransaction({
      type: "rule_run",
      title: "Automatisering uitgevoerd",
      description: `${rule.name} heeft geld naar ${jar.name} verplaatst.`,
      amount: rule.amount,
      details: {
        actie: "Automatisering uitgevoerd",
        bedrag: rule.amount,
        regel: rule.name,
        saldoNa: updatedJar.balance,
        saldoVoor: jar.balance,
        spaarpot: jar.name,
      },
      jarId: jar.id,
      jarName: jar.name,
    })

    setDashboardState((currentState) => {
      return {
        ...currentState,
        jars: nextJars,
        rules: currentState.rules,
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: getNextUnassignedSavings(currentState, nextJars),
      }
    })

    void Promise.all([
      saveJarToSupabase(updatedJar),
      saveTransactionToSupabase(transaction, {
        targetJarId: jar.id,
      }),
    ]).catch((error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Automatisering uitvoeren is niet gelukt"
      )
    })

    toast.success(
      `${formatCurrency(rule.amount)} naar "${jar.name}" verplaatst via automatisering`
    )
  }

  function clearData() {
    clearDashboardState()
    setDashboardState(emptyDashboardState)
    setJarToDelete(null)
    setJarToEdit(null)
    setRuleToDeleteId(null)
    setDetailJarId(null)
    setMoveTargetJarId(null)

    if (!syncEnabled) {
      toast.success("Demo-data gewist")
      return
    }

    void clearSupabaseData()
      .then(() => {
        toast.success("Accountdata gewist")
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Accountdata wissen is niet gelukt"
        )
      })
  }

  function importData(importedState: DashboardState) {
    const normalizedState = normalizeDashboardStateForPersistence(importedState)

    setDashboardState(normalizedState)
    setJarToDelete(null)
    setJarToEdit(null)
    setDetailJarId(null)
    setMoveTargetJarId(null)

    if (!syncEnabled) {
      toast.success("Demo-data geimporteerd")
      return
    }

    void replaceSupabaseData(normalizedState)
      .then(() => {
        toast.success("Accountdata geimporteerd")
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Accountdata importeren is niet gelukt"
        )
      })
  }

  function openMoveMoneyForJar(jar: SavingsJar) {
    setMoveTargetJarId(jar.id)
    setIsMoveMoneySheetOpen(true)
  }

  async function clearSupabaseData() {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const operations = [
      () => supabase.from("savings_rules").delete().eq("user_id", userId),
      () => supabase.from("transactions").delete().eq("user_id", userId),
      () => supabase.from("savings_jars").delete().eq("user_id", userId),
      () => supabase.from("accounts").delete().eq("user_id", userId),
    ]

    for (const operation of operations) {
      const { error } = await operation()

      if (error) {
        throw error
      }
    }
  }

  async function replaceSupabaseData(state: DashboardState) {
    if (!syncEnabled) {
      return
    }

    await clearSupabaseData()

    await saveAccountsToSupabase(state.accounts)
    await Promise.all(state.jars.map((jar) => saveJarToSupabase(jar)))
    await Promise.all(state.rules.map((rule) => saveRuleToSupabase(rule)))
    await Promise.all(
      state.transactions.map((transaction) =>
        saveTransactionToSupabase(transaction)
      )
    )
  }

  async function saveAccountsToSupabase(nextAccounts: SavingsAccount[]) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()

    if (nextAccounts.length > 0) {
      const { error } = await supabase.from("accounts").upsert(
        nextAccounts.map((account) => ({
          balance: account.balance,
          id: account.id,
          name: account.name,
          user_id: userId,
        }))
      )

      if (error) {
        throw error
      }
    }

    const nextAccountIds = nextAccounts.map((account) => account.id)
    let deleteQuery = supabase.from("accounts").delete().eq("user_id", userId)

    if (nextAccountIds.length > 0) {
      deleteQuery = deleteQuery.not("id", "in", `(${nextAccountIds.join(",")})`)
    }

    const { error } = await deleteQuery

    if (error) {
      throw error
    }
  }

  async function saveJarToSupabase(jar: SavingsJar) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("savings_jars")
      .upsert(toSavingsJarRow(jar, userId))

    if (error) {
      throw error
    }
  }

  async function deleteJarFromSupabase(jarId: string) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("savings_jars")
      .delete()
      .eq("id", jarId)
      .eq("user_id", userId)

    if (error) {
      throw error
    }
  }

  async function saveRuleToSupabase(rule: SavingsRule) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("savings_rules")
      .upsert(toSavingsRuleRow(rule, userId))

    if (error) {
      throw error
    }
  }

  async function deleteRuleFromSupabase(ruleId: string) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("savings_rules")
      .delete()
      .eq("id", ruleId)
      .eq("user_id", userId)

    if (error) {
      throw error
    }
  }

  async function saveTransactionToSupabase(
    transaction: Transaction,
    options: {
      sourceJarId?: string | null
      targetJarId?: string | null
    } = {}
  ) {
    if (!syncEnabled) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("transactions").insert({
      amount: transaction.amount ?? null,
      description: transaction.description,
      id: transaction.id,
      jar_id: transaction.jarId ?? null,
      metadata: {
        ...(transaction.details ? { details: transaction.details } : {}),
        ...(transaction.jarName ? { jar_name: transaction.jarName } : {}),
        ui_type: transaction.type,
      },
      source_jar_id: options.sourceJarId ?? null,
      target_jar_id: options.targetJarId ?? null,
      title: transaction.title,
      type: toDbTransactionType(transaction.type),
      user_id: userId,
    })

    if (error) {
      throw error
    }
  }

  function setAccounts(accounts: DashboardState["accounts"]) {
    const normalizedAccounts = normalizeAccounts(accounts)
    const totalAccounts = getTotalAccountBalance(normalizedAccounts)
    const totalAssigned = getTotalAssigned(jars)

    if (totalAccounts < totalAssigned) {
      return Promise.resolve(false)
    }

    const previousAccounts = dashboardState.accounts
    const previousTotalAccounts = getTotalAccountBalance(previousAccounts)
    const addedAccounts = normalizedAccounts.filter(
      (account) =>
        !previousAccounts.some(
          (previousAccount) => previousAccount.id === account.id
        )
    )
    const removedAccounts = previousAccounts.filter(
      (account) =>
        !normalizedAccounts.some((nextAccount) => nextAccount.id === account.id)
    )
    const changedAccounts = normalizedAccounts.filter((account) => {
      const previousAccount = previousAccounts.find(
        (previousAccount) => previousAccount.id === account.id
      )

      return (
        previousAccount &&
        (previousAccount.balance !== account.balance ||
          previousAccount.name !== account.name)
      )
    })
    const primaryAddedAccount =
      addedAccounts.length === 1 &&
      changedAccounts.length === 0 &&
      removedAccounts.length === 0
        ? addedAccounts[0]
        : null
    const primaryRemovedAccount =
      removedAccounts.length === 1 &&
      addedAccounts.length === 0 &&
      changedAccounts.length === 0
        ? removedAccounts[0]
        : null
    const primaryChangedAccount =
      changedAccounts.length === 1 &&
      addedAccounts.length === 0 &&
      removedAccounts.length === 0
        ? changedAccounts[0]
        : null
    const previousChangedAccount = primaryChangedAccount
      ? previousAccounts.find(
          (account) => account.id === primaryChangedAccount.id
        )
      : null
    const accountDelta = totalAccounts - previousTotalAccounts
    const transaction = createTransaction({
      type: "accounts_updated",
      title: primaryAddedAccount
        ? "Rekening toegevoegd"
        : primaryRemovedAccount
          ? "Rekening verwijderd"
          : "Rekeningen bijgewerkt",
      description: primaryAddedAccount
        ? `${primaryAddedAccount.name} is toegevoegd.`
        : primaryRemovedAccount
          ? `${primaryRemovedAccount.name} is verwijderd.`
          : "Je totale spaargeld is opnieuw ingesteld.",
      amount: Math.abs(accountDelta) || totalAccounts,
      details: primaryAddedAccount
        ? {
            actie: "Rekening toegevoegd",
            subtype: "account_created",
            naamRekening: primaryAddedAccount.name,
            beginsaldoRekening: primaryAddedAccount.balance,
          }
        : primaryRemovedAccount
          ? {
              actie: "Rekening verwijderd",
              subtype: "account_deleted",
              bedragToegevoegdOfVerwijderd: accountDelta,
              naamRekening: primaryRemovedAccount.name,
              rekeningId: primaryRemovedAccount.id,
              saldoNa: totalAccounts,
              saldoRekeningBijVerwijderen: primaryRemovedAccount.balance,
              saldoVoor: previousTotalAccounts,
            }
          : {
              actie: "Rekeningen bijgewerkt",
              subtype: "account_updated",
              aantalRekeningen: normalizedAccounts.length,
              aantalRekeningenToegevoegd: addedAccounts.length,
              aantalRekeningenVerwijderd: removedAccounts.length,
              bedragToegevoegdOfVerwijderd: accountDelta,
              naamRekening: primaryChangedAccount?.name ?? null,
              toegevoegdeRekeningen: addedAccounts
                .map((account) => account.name)
                .join(", "),
              verwijderdeRekeningen: removedAccounts
                .map((account) => account.name)
                .join(", "),
              saldoNa: primaryChangedAccount?.balance ?? totalAccounts,
              saldoVoor:
                previousChangedAccount?.balance ?? previousTotalAccounts,
              totaalSpaargeld: totalAccounts,
            },
    })

    setDashboardState((currentState) => {
      return {
        ...currentState,
        accounts: normalizedAccounts,
        transactions: prependCreatedTransaction(
          currentState.transactions,
          transaction
        ),
        unassignedSavings: Math.max(0, totalAccounts - totalAssigned),
      }
    })

    return Promise.all([
      saveAccountsToSupabase(normalizedAccounts),
      saveTransactionToSupabase(transaction),
    ])
      .then(() => {
        toast.success("Rekeningen opgeslagen")
        return true
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Rekeningen opslaan is niet gelukt"
        )
        return false
      })
  }

  const value: WallieAppContextValue = {
    accounts,
    dashboardState: normalizedDashboardState,
    detailJarId,
    isAccountDialogOpen,
    isCreateDialogOpen,
    isMoveMoneySheetOpen,
    isRuleDialogOpen,
    isSettingsDialogOpen,
    jarToDelete,
    jarToEdit,
    jars,
    moveTargetJarId,
    ruleToEdit,
    ruleToDelete,
    rules,
    selectedJar,
    totalAvailable,
    totalGoal,
    totalSaved,
    transactions,
    unassignedSavings,
    isDemoMode: !syncEnabled,
    clearData,
    createJar,
    createRule,
    deleteJar,
    deleteRule,
    importData,
    moveMoney,
    openMoveMoneyForJar,
    runRule,
    setRuleToEdit,
    setRuleToDelete: setRuleToDeleteId,
    updateRule,
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
    toggleRule,
    updateJar,
  }

  return (
    <WallieAppContext.Provider value={value}>
      {children}
    </WallieAppContext.Provider>
  )
}

export function useWallieApp() {
  const context = useContext(WallieAppContext)

  if (!context) {
    throw new Error("useWallieApp must be used within WallieAppProvider")
  }

  return context
}
