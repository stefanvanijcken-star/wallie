"use client"

import { useEffect } from "react"
import { RotateCcw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <TriangleAlert className="size-6" aria-hidden="true" />
          </div>
          <CardTitle>Er ging iets mis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Wallie kon deze pagina niet laden. Probeer het opnieuw; als het
            probleem blijft bestaan, kun je later terugkomen.
          </p>
          <Button className="mx-auto" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Probeer opnieuw
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
