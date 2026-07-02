import type { Metadata } from "next"

import { JarsView } from "@/features/dashboard/wallie-views"

export const metadata: Metadata = {
  title: "Spaarpotten",
}

export default function JarsPage() {
  return <JarsView />
}
