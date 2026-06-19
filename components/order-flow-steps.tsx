"use client"

import { CheckCircle, Circle, XCircle } from "lucide-react"
import type { OrderWithRelations, RequestWithRelations } from "@/lib/types/database"
import { cn } from "@/lib/utils"

export function OrderFlowSteps({
  request,
  order,
}: {
  request: RequestWithRelations
  order?: OrderWithRelations | null
}) {
  const hasQuote = Boolean(request.quoted_price)
  const artistAccepted = request.artist_decision === "accepted" || hasQuote || Boolean(order)
  const artistRejected = request.artist_decision === "rejected" || request.status === "rejected"
  const paid = Boolean(order?.paid_at) || Boolean(order && !["draft", "awaiting_payment"].includes(order.status))
  const inProduction = Boolean(order && ["in_progress", "preview_shared", "revision_requested", "ready_to_ship", "shipped", "delivered", "completed"].includes(order.status))
  const delivered = Boolean(order && ["delivered", "completed"].includes(order.status))
  const completed = request.status === "completed" || order?.status === "completed"
  const createdAt = new Date(request.created_at)
  const addDays = (days: number) => {
    const date = new Date(createdAt)
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString()
  }

  const steps = [
    { label: "Request created", detail: "Your brief is saved with references and budget.", eta: createdAt.toLocaleDateString(), done: true },
    { label: "Admin review", detail: "Giftra checks fit, safety, and assignment.", eta: `Expected by ${addDays(1)}`, done: Boolean(request.assigned_artist_id || request.approved_at || request.status !== "pending_review") },
    { label: "Artist accepts", detail: "The assigned artist confirms availability.", eta: `Expected by ${addDays(2)}`, done: artistAccepted, rejected: artistRejected },
    { label: "Final price sent", detail: "Artist proposes final price after discussion.", eta: `Expected by ${addDays(3)}`, done: hasQuote },
    { label: "Customer accepts", detail: "Customer approves scope and final price.", eta: request.quoted_price ? "Next action" : "Waiting for quote", done: Boolean(order) },
    { label: "Payment", detail: "Secure payment confirms production start.", eta: order ? "Payment due now" : "After acceptance", done: paid },
    { label: "Production", detail: "Artist creates the custom gift and shares updates.", eta: order?.paid_at ? `Starts ${new Date(order.paid_at).toLocaleDateString()}` : "After payment", done: inProduction },
    { label: "Preview/shipping", detail: "Preview, revisions, shipping, and tracking.", eta: `Around ${addDays(10)}`, done: Boolean(order && ["preview_shared", "revision_requested", "ready_to_ship", "shipped", "delivered", "completed"].includes(order.status)) },
    { label: "Delivered", detail: "Customer confirms delivery and leaves review.", eta: `ETA ${addDays(14)}`, done: delivered },
    { label: "Completed", detail: "Review closes the loop and updates artist rating.", eta: delivered ? "Next action" : "After delivery", done: completed },
  ]

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-4 font-semibold">Order flow</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.rejected ? XCircle : step.done ? CheckCircle : Circle
          return (
            <div
              key={step.label}
              className={cn(
                "flex items-center gap-3 rounded-md border p-3 text-sm",
                step.done && "border-success/40 bg-success/10 text-success-foreground",
                step.rejected && "border-destructive/40 bg-destructive/10 text-destructive",
                !step.done && !step.rejected && "bg-muted/40 text-muted-foreground opacity-70"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", step.done && "text-success", step.rejected && "text-destructive")} />
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="text-xs opacity-75">{step.detail}</p>
                <p className="mt-1 text-[11px] opacity-70">{step.eta}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
