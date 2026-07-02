import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <main className="min-h-svh bg-background pb-24 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:gap-8 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="hidden h-4 w-64 sm:block" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <Skeleton className="h-40 w-full rounded-3xl" />

        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>

        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    </main>
  )
}
