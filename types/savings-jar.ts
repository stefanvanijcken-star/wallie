import type { LucideIcon } from "lucide-react"

export type SavingsJarColor = {
  name: string
  accentClass: string
  barClass: string
  chartColor: string
}

export type SavingsJar = {
  id: string
  name: string
  icon: LucideIcon
  iconName: string
  balance: number
  color: SavingsJarColor
  goal?: number
  targetDate?: string
}
