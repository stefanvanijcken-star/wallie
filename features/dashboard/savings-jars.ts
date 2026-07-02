import { Car, Home, Laptop, Plane } from "lucide-react"

import type { SavingsJar, SavingsJarColor } from "@/types/savings-jar"

export const savingsJarColors: SavingsJarColor[] = [
  {
    name: "Slate",
    accentClass:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-400/20",
    barClass: "bg-slate-500",
    chartColor: "var(--color-slate-500)",
  },
  {
    name: "Gray",
    accentClass:
      "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:ring-gray-400/20",
    barClass: "bg-gray-500",
    chartColor: "var(--color-gray-500)",
  },
  {
    name: "Zinc",
    accentClass:
      "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-400/20",
    barClass: "bg-zinc-500",
    chartColor: "var(--color-zinc-500)",
  },
  {
    name: "Neutral",
    accentClass:
      "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-500/15 dark:text-neutral-300 dark:ring-neutral-400/20",
    barClass: "bg-neutral-500",
    chartColor: "var(--color-neutral-500)",
  },
  {
    name: "Stone",
    accentClass:
      "bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-500/15 dark:text-stone-300 dark:ring-stone-400/20",
    barClass: "bg-stone-500",
    chartColor: "var(--color-stone-500)",
  },
  {
    name: "Red",
    accentClass:
      "bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20",
    barClass: "bg-red-500",
    chartColor: "var(--color-red-500)",
  },
  {
    name: "Orange",
    accentClass:
      "bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/20",
    barClass: "bg-orange-500",
    chartColor: "var(--color-orange-500)",
  },
  {
    name: "Amber",
    accentClass:
      "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
    barClass: "bg-amber-500",
    chartColor: "var(--color-amber-500)",
  },
  {
    name: "Yellow",
    accentClass:
      "bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:ring-yellow-400/20",
    barClass: "bg-yellow-500",
    chartColor: "var(--color-yellow-500)",
  },
  {
    name: "Lime",
    accentClass:
      "bg-lime-100 text-lime-700 ring-lime-200 dark:bg-lime-500/15 dark:text-lime-300 dark:ring-lime-400/20",
    barClass: "bg-lime-500",
    chartColor: "var(--color-lime-500)",
  },
  {
    name: "Green",
    accentClass:
      "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20",
    barClass: "bg-green-500",
    chartColor: "var(--color-green-500)",
  },
  {
    name: "Emerald",
    accentClass:
      "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
    barClass: "bg-emerald-500",
    chartColor: "var(--color-emerald-500)",
  },
  {
    name: "Teal",
    accentClass:
      "bg-teal-100 text-teal-700 ring-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-400/20",
    barClass: "bg-teal-500",
    chartColor: "var(--color-teal-500)",
  },
  {
    name: "Cyan",
    accentClass:
      "bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-400/20",
    barClass: "bg-cyan-500",
    chartColor: "var(--color-cyan-500)",
  },
  {
    name: "Sky",
    accentClass:
      "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/20",
    barClass: "bg-sky-500",
    chartColor: "var(--color-sky-500)",
  },
  {
    name: "Blue",
    accentClass:
      "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
    barClass: "bg-blue-500",
    chartColor: "var(--color-blue-500)",
  },
  {
    name: "Indigo",
    accentClass:
      "bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/20",
    barClass: "bg-indigo-500",
    chartColor: "var(--color-indigo-500)",
  },
  {
    name: "Violet",
    accentClass:
      "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20",
    barClass: "bg-violet-500",
    chartColor: "var(--color-violet-500)",
  },
  {
    name: "Purple",
    accentClass:
      "bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/20",
    barClass: "bg-purple-500",
    chartColor: "var(--color-purple-500)",
  },
  {
    name: "Fuchsia",
    accentClass:
      "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:ring-fuchsia-400/20",
    barClass: "bg-fuchsia-500",
    chartColor: "var(--color-fuchsia-500)",
  },
  {
    name: "Pink",
    accentClass:
      "bg-pink-100 text-pink-700 ring-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-400/20",
    barClass: "bg-pink-500",
    chartColor: "var(--color-pink-500)",
  },
  {
    name: "Rose",
    accentClass:
      "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
    barClass: "bg-rose-500",
    chartColor: "var(--color-rose-500)",
  },
]

export const initialSavingsJars: SavingsJar[] = [
  {
    id: "vacation",
    name: "Vakantie",
    icon: Plane,
    iconName: "Vakantie",
    balance: 1240,
    goal: 2000,
    targetDate: "2026-08-15",
    color: savingsJarColors[15],
  },
  {
    id: "laptop",
    name: "Nieuwe laptop",
    icon: Laptop,
    iconName: "Laptop",
    balance: 680,
    goal: 1400,
    targetDate: "2026-11-01",
    color: savingsJarColors[18],
  },
  {
    id: "home-buffer",
    name: "Woningbuffer",
    icon: Home,
    iconName: "Wonen",
    balance: 3850,
    goal: 5000,
    color: savingsJarColors[20],
  },
  {
    id: "car-maintenance",
    name: "Auto onderhoud",
    icon: Car,
    iconName: "Auto",
    balance: 420,
    goal: 750,
    targetDate: "2026-09-30",
    color: savingsJarColors[5],
  },
]
