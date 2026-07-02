import { getIconOption } from "@/features/dashboard/jar-options"
import {
  initialSavingsJars,
  savingsJarColors,
} from "@/features/dashboard/savings-jars"
import type { SavingsJar } from "@/types/savings-jar"
import type { SavingsAccount } from "@/types/savings-account"
import type { SavingsRule, SavingsRuleFrequency } from "@/types/savings-rule"
import type { Transaction } from "@/types/transaction"

const storageKey = "wallie-dashboard-state"

export type DashboardState = {
  accounts: SavingsAccount[]
  jars: SavingsJar[]
  rules: SavingsRule[]
  transactions: Transaction[]
  unassignedSavings: number
}

type StoredSavingsJar = Omit<SavingsJar, "color" | "icon"> & {
  colorName: string
}

type StoredDashboardState = {
  accounts?: SavingsAccount[]
  jars: StoredSavingsJar[]
  rules?: Array<Omit<SavingsRule, "scheduleDay"> & { scheduleDay?: number }>
  transactions?: Transaction[]
  unassignedSavings: number
}

export const initialDashboardState: DashboardState = {
  accounts: [
    {
      id: "main-savings",
      name: "Spaarrekening",
      balance: 7120,
    },
  ],
  jars: initialSavingsJars,
  rules: [],
  transactions: [],
  unassignedSavings: 930,
}

export const emptyDashboardState: DashboardState = {
  accounts: [],
  jars: [],
  rules: [],
  transactions: [],
  unassignedSavings: 0,
}

function reviveJar(jar: StoredSavingsJar): SavingsJar {
  const iconOption = getIconOption(jar.iconName)

  return {
    ...jar,
    icon: iconOption.icon,
    iconName: iconOption.name,
    color:
      savingsJarColors.find((color) => color.name === jar.colorName) ??
      savingsJarColors[0],
  }
}

function serializeJar(jar: SavingsJar): StoredSavingsJar {
  return {
    id: jar.id,
    name: jar.name,
    iconName: jar.iconName,
    balance: jar.balance,
    goal: jar.goal,
    targetDate: jar.targetDate,
    colorName: jar.color.name,
  }
}

function getDefaultScheduleDay(frequency: SavingsRuleFrequency) {
  return frequency === "weekly" ? 1 : 1
}

function reviveRule(
  rule: Omit<SavingsRule, "scheduleDay"> & { scheduleDay?: number }
): SavingsRule {
  return {
    ...rule,
    scheduleDay: rule.scheduleDay ?? getDefaultScheduleDay(rule.frequency),
  }
}

function getTotalAssigned(jars: SavingsJar[]) {
  return jars.reduce((total, jar) => total + jar.balance, 0)
}

function getTotalAvailable(accounts: SavingsAccount[]) {
  return accounts.reduce((total, account) => total + account.balance, 0)
}

function reviveDashboardState(state: StoredDashboardState): DashboardState {
  const jars = state.jars.map(reviveJar)
  const unassignedSavings = Number(state.unassignedSavings) || 0
  const totalAssigned = getTotalAssigned(jars)
  const accounts =
    state.accounts ??
    (jars.length > 0 || unassignedSavings > 0
      ? [
          {
            id: "main-savings",
            name: "Spaarrekening",
            balance: totalAssigned + unassignedSavings,
          },
        ]
      : [])
  const totalAvailable = getTotalAvailable(accounts)
  const balancedAccounts =
    accounts.length > 0 && totalAvailable < totalAssigned
      ? [
          ...accounts,
          {
            id: "account-correction",
            name: "Correctie",
            balance: totalAssigned - totalAvailable,
          },
        ]
      : accounts

  return {
    accounts: balancedAccounts,
    jars,
    rules: (state.rules ?? []).map(reviveRule),
    transactions: state.transactions ?? [],
    unassignedSavings: Math.max(
      getTotalAvailable(balancedAccounts) - totalAssigned,
      0
    ),
  }
}

function serializeDashboardState(state: DashboardState): StoredDashboardState {
  const totalAssigned = getTotalAssigned(state.jars)
  const totalAvailable = getTotalAvailable(state.accounts)

  return {
    accounts: state.accounts,
    jars: state.jars.map(serializeJar),
    rules: state.rules,
    transactions: state.transactions,
    unassignedSavings: Math.max(totalAvailable - totalAssigned, 0),
  }
}

export function exportDashboardState(state: DashboardState) {
  return JSON.stringify(serializeDashboardState(state), null, 2)
}

export function importDashboardState(value: string): DashboardState {
  const parsedValue = JSON.parse(value) as StoredDashboardState

  if (!Array.isArray(parsedValue.jars)) {
    throw new Error("Invalid Wallie export")
  }

  return reviveDashboardState({
    accounts: parsedValue.accounts,
    jars: parsedValue.jars,
    rules: parsedValue.rules ?? [],
    transactions: parsedValue.transactions ?? [],
    unassignedSavings: Number(parsedValue.unassignedSavings) || 0,
  })
}

export function loadDashboardState(): DashboardState {
  if (typeof window === "undefined") {
    return initialDashboardState
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey)

    if (!storedValue) {
      return initialDashboardState
    }

    const parsedValue = JSON.parse(storedValue) as StoredDashboardState

    return reviveDashboardState(parsedValue)
  } catch {
    return initialDashboardState
  }
}

export function saveDashboardState(state: DashboardState) {
  if (typeof window === "undefined") {
    return
  }

  const storedState = serializeDashboardState(state)

  window.localStorage.setItem(storageKey, JSON.stringify(storedState))
}

export function clearDashboardState() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(storageKey)
}
