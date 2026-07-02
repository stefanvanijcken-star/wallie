import type { Metadata } from "next"

import { SettingsView } from "@/features/dashboard/wallie-views"

export const metadata: Metadata = {
  title: "Instellingen",
}

export default function SettingsPage() {
  return <SettingsView />
}
