"use client"

import { useSyncExternalStore } from "react"
import { CheckCircle2, Circle, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const dismissKey = "wallie-onboarding-dismissed"
const dismissEvent = "wallie-onboarding-dismissed-change"

type OnboardingBannerProps = {
  hasAccounts: boolean
  hasJars: boolean
  hasDistributed: boolean
  onAddAccounts: () => void
  onCreateJar: () => void
  onMoveMoney: () => void
}

export function OnboardingBanner({
  hasAccounts,
  hasJars,
  hasDistributed,
  onAddAccounts,
  onCreateJar,
  onMoveMoney,
}: OnboardingBannerProps) {
  const dismissed = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange)
      window.addEventListener(dismissEvent, onStoreChange)

      return () => {
        window.removeEventListener("storage", onStoreChange)
        window.removeEventListener(dismissEvent, onStoreChange)
      }
    },
    () => window.localStorage.getItem(dismissKey) === "true",
    () => true
  )
  const allDone = hasAccounts && hasJars && hasDistributed

  if (dismissed || allDone) {
    return null
  }

  function handleDismiss() {
    window.localStorage.setItem(dismissKey, "true")
    window.dispatchEvent(new Event(dismissEvent))
  }

  const steps = [
    {
      label: "Rekening invoeren",
      description: "Vul het saldo in van je spaarrekening.",
      done: hasAccounts,
      action: onAddAccounts,
      actionLabel: "Rekening toevoegen",
    },
    {
      label: "Spaarpot aanmaken",
      description: "Maak een pot voor elk spaardoel.",
      done: hasJars,
      action: onCreateJar,
      actionLabel: "Spaarpot maken",
    },
    {
      label: "Geld verdelen",
      description: "Wijs je saldo toe aan de potten.",
      done: hasDistributed,
      action: onMoveMoney,
      actionLabel: "Geld verdelen",
    },
  ]

  const currentStep = steps.findIndex((step) => !step.done)

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <button
        aria-label="Verberg gids"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        type="button"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <p className="mb-3 text-sm font-medium">Aan de slag met Wallie</p>
      <ol className="grid gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep

          return (
            <li key={step.label} className="flex items-center gap-3">
              {step.done ? (
                <CheckCircle2
                  className="size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className={`size-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`}
                  aria-hidden="true"
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span
                  className={`text-sm ${step.done ? "text-muted-foreground line-through" : isActive ? "font-medium" : "text-muted-foreground"}`}
                >
                  {step.label}
                  {!step.done && isActive ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      - {step.description}
                    </span>
                  ) : null}
                </span>
                {isActive ? (
                  <Button
                    className="w-fit shrink-0"
                    onClick={step.action}
                    size="sm"
                    variant="outline"
                  >
                    {step.actionLabel}
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
