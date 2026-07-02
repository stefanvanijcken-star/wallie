import type { Metadata } from "next"

import { ActivityView } from "@/features/dashboard/wallie-views"

export const metadata: Metadata = {
  title: "Activiteit",
}

export default function ActivityPage() {
  return <ActivityView />
}
