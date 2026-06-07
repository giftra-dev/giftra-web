import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { orderId } = await request.json().catch(() => ({ orderId: null }))

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 })
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, customer_id, total, status")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.customer_id !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  if (!process.env.PAYMENT_PROVIDER) {
    return NextResponse.json(
      {
        error: "Payment provider is not configured",
        setup:
          "Set PAYMENT_PROVIDER plus provider keys, then create the real provider order here before redirecting to checkout.",
      },
      { status: 501 }
    )
  }

  return NextResponse.json(
    {
      orderId: order.id,
      amount: order.total,
      status: order.status,
      provider: process.env.PAYMENT_PROVIDER,
      message: "Provider-specific payment intent creation must be connected here.",
    },
    { status: 501 }
  )
}
