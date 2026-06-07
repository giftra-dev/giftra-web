import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase service role is not configured")
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET
  const incomingSecret = request.headers.get("x-giftra-webhook-secret")

  if (webhookSecret && incomingSecret !== webhookSecret) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const orderId = payload.order_id || payload.orderId
  const provider = payload.provider || process.env.PAYMENT_PROVIDER || "manual"
  const providerEventId = payload.event_id || payload.eventId || payload.id || null
  const providerPaymentId = payload.payment_id || payload.paymentId || payload.provider_payment_id || null
  const amount = Number(payload.amount || 0)
  const status = payload.status || "received"

  if (!orderId || !providerPaymentId || !amount) {
    return NextResponse.json(
      { error: "order_id, payment_id, and amount are required" },
      { status: 400 }
    )
  }

  const supabase = getAdminClient()

  const { error: eventError } = await supabase
    .from("payment_events")
    .upsert(
      {
        order_id: orderId,
        provider,
        provider_event_id: providerEventId,
        provider_payment_id: providerPaymentId,
        amount,
        currency: payload.currency || "INR",
        status,
        raw_payload: payload,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_event_id" }
    )

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 })
  }

  if (["paid", "captured", "succeeded", "success"].includes(String(status).toLowerCase())) {
    const { error } = await supabase.rpc("record_payment_and_unlock_chat", {
      p_order_id: orderId,
      p_provider_payment_id: providerPaymentId,
      p_amount: amount,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
