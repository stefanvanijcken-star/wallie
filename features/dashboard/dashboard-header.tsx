import { ArrowRightLeft, Plus, WalletCards } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { WallieView } from "@/features/dashboard/dashboard-sidebar"

type DashboardHeaderProps = {
  activeView: WallieView
  canMoveMoney: boolean
  description: string
  title: string
  onCreateJar: () => void
  onCreateRule: () => void
  onManageAccounts: () => void
  onMoveMoney: () => void
}

export function DashboardHeader({
  activeView,
  canMoveMoney,
  description,
  onManageAccounts,
  onCreateJar,
  onCreateRule,
  onMoveMoney,
  title,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-medium tracking-normal text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {description}
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 md:hidden">
        {activeView === "rules" ? (
          <Button className="col-span-3" onClick={onCreateRule} size="sm">
            <Plus data-icon="inline-start" />
            Nieuw
          </Button>
        ) : activeView === "analytics" ? (
          <Button
            className="col-span-3"
            onClick={onManageAccounts}
            size="sm"
            variant="outline"
          >
            <WalletCards data-icon="inline-start" />
            Rekeningen
          </Button>
        ) : activeView === "activity" || activeView === "settings" ? null : (
          <>
            <Button
              disabled={!canMoveMoney}
              onClick={onMoveMoney}
              size="sm"
              variant="outline"
            >
              <ArrowRightLeft data-icon="inline-start" />
              Verplaats
            </Button>
            <Button onClick={onManageAccounts} size="sm" variant="outline">
              <WalletCards data-icon="inline-start" />
              Rekening
            </Button>
            <Button onClick={onCreateJar} size="sm">
              <Plus data-icon="inline-start" />
              Pot
            </Button>
          </>
        )}
      </div>

      <div className="hidden w-full grid-cols-2 gap-2 md:flex md:w-auto md:items-center">
        {activeView === "rules" ? (
          <Button
            onClick={onCreateRule}
            size="lg"
            className="col-span-2 sm:col-span-1"
          >
            <Plus data-icon="inline-start" />
            Nieuwe automatisering
          </Button>
        ) : activeView === "analytics" ? (
          <Button
            onClick={onManageAccounts}
            size="lg"
            variant="outline"
            className="col-span-2 sm:col-span-1"
          >
            <WalletCards data-icon="inline-start" />
            Rekeningen
          </Button>
        ) : activeView === "activity" || activeView === "settings" ? null : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={canMoveMoney ? -1 : 0}
                  className="col-span-2 sm:col-span-1"
                >
                  <Button
                    className="w-full"
                    disabled={!canMoveMoney}
                    onClick={onMoveMoney}
                    size="lg"
                  >
                    <ArrowRightLeft data-icon="inline-start" />
                    Geld verplaatsen
                  </Button>
                </span>
              </TooltipTrigger>
              {!canMoveMoney ? (
                <TooltipContent side="bottom">
                  Voeg eerst saldo in bij Rekeningen
                </TooltipContent>
              ) : null}
            </Tooltip>
            <Button onClick={onManageAccounts} size="lg" variant="outline">
              <WalletCards data-icon="inline-start" />
              Rekeningen
            </Button>
            <Button onClick={onCreateJar} size="lg" variant="outline">
              <Plus data-icon="inline-start" />
              Nieuwe spaarpot
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
