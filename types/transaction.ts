export type TransactionType =
  | "jar_created"
  | "jar_deleted"
  | "jar_updated"
  | "money_distributed"
  | "money_moved"
  | "accounts_updated"
  | "rule_created"
  | "rule_deleted"
  | "rule_updated"
  | "rule_run"

export type TransactionDetailValue =
  string | number | boolean | null | undefined

export type Transaction = {
  id: string
  type: TransactionType
  title: string
  description: string
  createdAt: string
  amount?: number
  jarId?: string
  jarName?: string
  details?: Record<string, TransactionDetailValue>
}
