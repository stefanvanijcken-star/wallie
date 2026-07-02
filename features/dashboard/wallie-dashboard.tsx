import type { ReactNode } from "react"

import type { WallieView } from "@/features/dashboard/dashboard-sidebar"
import {
  ActivityView,
  AnalyticsView,
  DashboardView,
  JarsView,
  RulesView,
  SettingsView,
} from "@/features/dashboard/wallie-views"

type WallieDashboardProps = {
  view?: WallieView
}

export function WallieDashboard({ view = "dashboard" }: WallieDashboardProps) {
  const views: Record<WallieView, ReactNode> = {
    activity: <ActivityView />,
    analytics: <AnalyticsView />,
    dashboard: <DashboardView />,
    jars: <JarsView />,
    rules: <RulesView />,
    settings: <SettingsView />,
  }

  return views[view]
}
