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

import { WallieLogo } from "@/components/wallie-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { formatCurrency } from "@/features/dashboard/formatters"

type DashboardSidebarProps = {
  activeView: WallieView
  totalSaved: number
  unassignedSavings: number
  userEmail?: string
}

export type WallieView =
  "dashboard" | "analytics" | "jars" | "rules" | "activity" | "settings"

const navItems = [
  { label: "Dashboard", href: "/", icon: Gauge, view: "dashboard" },
  { label: "Spaarpotten", href: "/jars", icon: PiggyBank, view: "jars" },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    view: "analytics",
  },
  {
    label: "Automatisch sparen",
    href: "/rules",
    icon: CircleDollarSign,
    view: "rules",
  },
  { label: "Activiteit", href: "/activity", icon: Activity, view: "activity" },
] satisfies Array<{
  label: string
  href: string
  icon: typeof Gauge
  view: WallieView
}>

export function DashboardSidebar({
  activeView,
  totalSaved,
  unassignedSavings,
  userEmail,
}: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <WallieLogo className="h-5 w-7" />
              </div>
              <div className="grid min-w-0">
                <span className="truncate font-medium">Wallie</span>
                <span className="truncate text-xs text-muted-foreground">
                  Digitale spaarpot
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overzicht</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeView === item.view}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="grid gap-3">
          <div className="grid gap-1 rounded-2xl bg-sidebar-accent px-3 py-2 text-sm group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Gespaard</span>
              <span className="font-medium">{formatCurrency(totalSaved)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Vrij</span>
              <span className="font-medium">
                {formatCurrency(unassignedSavings)}
              </span>
            </div>
          </div>

          {userEmail ? (
            <div className="grid gap-0.5 px-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
              {userEmail.endsWith(".local") ? (
                <p className="text-xs text-muted-foreground">
                  Development modus
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeView === "settings"}
              tooltip="Instellingen"
            >
              <Link href="/settings">
                <Settings aria-hidden="true" />
                <span>Instellingen</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
