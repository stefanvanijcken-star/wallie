"use client"

import Link from "next/link"
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Gauge,
  PiggyBank,
  Settings,
} from "lucide-react"

import type { WallieView } from "@/features/dashboard/dashboard-sidebar"
import { cn } from "@/lib/utils"

type MobileBottomNavProps = {
  activeView: WallieView
}

const navItems = [
  { label: "Home", href: "/", icon: Gauge, view: "dashboard" },
  { label: "Potten", href: "/jars", icon: PiggyBank, view: "jars" },
  { label: "Analyse", href: "/analytics", icon: BarChart3, view: "analytics" },
  { label: "Auto", href: "/rules", icon: CircleDollarSign, view: "rules" },
  { label: "Log", href: "/activity", icon: Activity, view: "activity" },
  {
    label: "Instellingen",
    href: "/settings",
    icon: Settings,
    view: "settings",
  },
] satisfies Array<{
  label: string
  href: string
  icon: typeof Gauge
  view: WallieView
}>

export function MobileBottomNav({ activeView }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.view

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[0.6875rem] font-medium text-muted-foreground transition-colors",
                isActive && "bg-primary/15 text-primary"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
