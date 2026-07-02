import type { Metadata } from "next"

import { RulesView } from "@/features/dashboard/wallie-views"

export const metadata: Metadata = {
  title: "Automatisch sparen",
}

export default function RulesPage() {
  return <RulesView />
}
