import type { SavingsRule } from "@/types/savings-rule"

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatTargetDate(value?: string) {
  if (!value) {
    return "Geen datum"
  }

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function getProgress(balance: number, goal?: number) {
  if (!goal || goal <= 0) {
    return 0
  }

  return Math.min(Math.round((balance / goal) * 100), 100)
}

export function getNextRunDate(rule: SavingsRule): Date {
  const now = new Date()
  const result = new Date(now)

  if (rule.frequency === "weekly") {
    // scheduleDay: 1=Monday .. 7=Sunday (ISO)
    const todayIso = now.getDay() === 0 ? 7 : now.getDay()
    let daysUntil = rule.scheduleDay - todayIso
    if (daysUntil <= 0) daysUntil += 7
    result.setDate(now.getDate() + daysUntil)
  } else {
    // monthly: scheduleDay = day of month
    const target = rule.scheduleDay
    if (now.getDate() < target) {
      result.setDate(target)
    } else {
      result.setMonth(now.getMonth() + 1, target)
    }
  }

  return result
}

export function getNextRunLabel(rule: SavingsRule): string {
  if (!rule.active) return "Inactief"
  const date = getNextRunDate(rule)
  return `Volgende: ${new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" }).format(date)}`
}
