import type { Metadata } from "next"

import { AnalyticsView } from "@/features/dashboard/wallie-views"

export const metadata: Metadata = {
  title: "Analytics",
}

export default function AnalyticsPage() {
  return <AnalyticsView />
}
