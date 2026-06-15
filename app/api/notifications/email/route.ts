import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type EmailPayload = {
  to?: string
  subject?: string
  preview?: string
  body?: string
  actionUrl?: string
  actionLabel?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function buildEmailHtml(payload: Required<Pick<EmailPayload, "subject" | "body">> & EmailPayload) {
  const actionUrl = payload.actionUrl
  const absoluteActionUrl = actionUrl?.startsWith("http")
    ? actionUrl
    : actionUrl
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.giftra.co.in"}${actionUrl}`
      : ""

  return `
    <div style="font-family:Arial,sans-serif;background:#f7fbff;padding:24px;color:#172033">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9e7f3;border-radius:12px;padding:28px">
        <div style="font-size:22px;font-weight:700;color:#428dc7;margin-bottom:18px">Giftra</div>
        <h1 style="font-size:20px;line-height:1.3;margin:0 0 12px">${escapeHtml(payload.subject)}</h1>
        ${payload.preview ? `<p style="font-size:14px;color:#526174;margin:0 0 16px">${escapeHtml(payload.preview)}</p>` : ""}
        <p style="font-size:15px;line-height:1.6;margin:0 0 22px">${escapeHtml(payload.body)}</p>
        ${absoluteActionUrl ? `<a href="${escapeHtml(absoluteActionUrl)}" style="display:inline-block;background:#428dc7;color:#ffffff;text-decoration:none;border-radius:8px;padding:11px 16px;font-weight:700">${escapeHtml(payload.actionLabel || "Open Giftra")}</a>` : ""}
        <p style="font-size:12px;color:#6b7280;margin-top:26px">You are receiving this email because you have a Giftra account or an active Giftra request.</p>
      </div>
    </div>
  `
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as EmailPayload
  if (!payload.to || !payload.subject || !payload.body) {
    return NextResponse.json({ error: "Missing required email fields" }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.GIFTRA_EMAIL_FROM || "Giftra <notifications@giftra.co.in>"

  if (!apiKey) {
    console.info("Email skipped because RESEND_API_KEY is not configured", {
      to: payload.to,
      subject: payload.subject,
    })
    return NextResponse.json({ skipped: true })
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: buildEmailHtml({
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
        preview: payload.preview,
        actionUrl: payload.actionUrl,
        actionLabel: payload.actionLabel,
      }),
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    return NextResponse.json({ error: text || "Email provider failed" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
