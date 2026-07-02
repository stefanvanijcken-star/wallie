"use client"

import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { iconOptions } from "@/features/dashboard/jar-options"
import { savingsJarColors } from "@/features/dashboard/savings-jars"
import { cn } from "@/lib/utils"
import type { SavingsJarColor } from "@/types/savings-jar"

type JarAppearancePickerProps = {
  selectedColor: SavingsJarColor
  selectedIcon: (typeof iconOptions)[number]
  onColorChange: (color: SavingsJarColor) => void
  onIconChange: (icon: (typeof iconOptions)[number]) => void
}

export function JarAppearancePicker({
  onColorChange,
  onIconChange,
  selectedColor,
  selectedIcon,
}: JarAppearancePickerProps) {
  const SelectedIcon = selectedIcon.icon

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <Label>Kleur</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full justify-between"
              type="button"
              variant="outline"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn("size-3 rounded-full", selectedColor.barClass)}
                />
                <span className="truncate">{selectedColor.name}</span>
              </span>
              <ChevronDown
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72">
            <div className="grid grid-cols-2 gap-1 p-1">
              {savingsJarColors.map((color) => (
                <DropdownMenuItem
                  className="justify-between"
                  key={color.name}
                  onClick={() => onColorChange(color)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn("size-3 rounded-full", color.barClass)}
                    />
                    {color.name}
                  </span>
                  {selectedColor.name === color.name ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-3">
        <Label>Icoon</Label>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
          {iconOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedIcon.name === option.name

            return (
              <Tooltip key={option.name}>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={option.name}
                    aria-pressed={isSelected}
                    onClick={() => onIconChange(option)}
                    size="icon"
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{option.name}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <SelectedIcon className="size-4" aria-hidden="true" />
          {selectedIcon.name}
        </p>
      </div>
    </div>
  )
}
