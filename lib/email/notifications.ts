export type EmailNotificationPayload = {
  to: string
  subject: string
  preview?: string
  body: string
  actionUrl?: string
  actionLabel?: string
}

export async function sendEmailNotification(payload: EmailNotificationPayload) {
  if (typeof window === "undefined") return
  if (!payload.to) return

  try {
    await fetch("/api/notifications/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn("Email notification could not be queued:", error)
  }
}
