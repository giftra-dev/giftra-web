"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Giftra could not load this view. Try again, or return to the marketplace.
        </p>
        {error.digest ? <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p> : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => window.location.assign("/")}>Marketplace</Button>
          <Button onClick={reset}>Try again</Button>
        </div>
      </section>
    </main>
  )
}
