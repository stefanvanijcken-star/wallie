export type SavingsRuleFrequency = "weekly" | "monthly"

export type SavingsRule = {
  id: string
  name: string
  amount: number
  frequency: SavingsRuleFrequency
  scheduleDay: number
  jarId: string
  active: boolean
}
