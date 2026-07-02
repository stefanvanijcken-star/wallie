import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { WallieAppShell } from "@/features/dashboard/wallie-app-shell"
import { devUser, isDevAuthBypassEnabled } from "@/lib/auth/dev-user"
import { createClient } from "@/lib/supabase/server"
import type { SavingsAccount } from "@/types/savings-account"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (isDevAuthBypassEnabled()) {
      return (
        <WallieAppShell
          syncEnabled={false}
          userEmail={devUser.email}
          userId={devUser.id}
        >
          {children}
        </WallieAppShell>
      )
    }

    redirect("/login")
  }

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id,name,balance")
    .order("created_at", { ascending: true })

  const { data: jars, error: jarsError } = await supabase
    .from("savings_jars")
    .select("id,name,color,icon,balance,goal,target_date")
    .order("created_at", { ascending: true })

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("id,type,title,description,amount,created_at,jar_id,metadata")
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: rules, error: rulesError } = await supabase
    .from("savings_rules")
    .select("id,name,amount,frequency,schedule_day,jar_id,active")
    .order("created_at", { ascending: true })

  const hasLoadError = Boolean(
    accountsError || jarsError || transactionsError || rulesError
  )

  const initialAccounts: SavingsAccount[] =
    accounts?.map((account) => ({
      id: account.id,
      name: account.name,
      balance: Number(account.balance) || 0,
    })) ?? []

  return (
    <WallieAppShell
      initialAccounts={initialAccounts}
      initialJars={
        jars?.map((jar) => ({
          balance: Number(jar.balance) || 0,
          colorName: jar.color,
          goal: jar.goal == null ? undefined : Number(jar.goal),
          iconName: jar.icon,
          id: jar.id,
          name: jar.name,
          targetDate: jar.target_date ?? undefined,
        })) ?? []
      }
      initialRules={
        rules?.map((rule) => ({
          active: rule.active,
          amount: Number(rule.amount) || 0,
          frequency: rule.frequency,
          id: rule.id,
          jarId: rule.jar_id,
          name: rule.name,
          scheduleDay: rule.schedule_day,
        })) ?? []
      }
      initialTransactions={
        transactions?.map((transaction) => ({
          amount:
            transaction.amount == null ? undefined : Number(transaction.amount),
          createdAt: transaction.created_at,
          description: transaction.description ?? "",
          id: transaction.id,
          jarId: transaction.jar_id ?? undefined,
          metadata: transaction.metadata,
          title: transaction.title,
          type: transaction.type,
        })) ?? []
      }
      loadError={hasLoadError}
      userEmail={user.email}
      userId={user.id}
    >
      {children}
    </WallieAppShell>
  )
}
