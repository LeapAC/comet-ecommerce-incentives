import "server-only"

import { Resend } from "resend"

/**
 * Sends the post-purchase confirmation email via Resend.
 *
 * Degrades gracefully: if `RESEND_API_KEY` is not configured (or the send
 * fails), it logs and returns `{ sent: false, reason }` instead of throwing, so
 * the confirmation page never crashes. The rendered HTML is always returned to
 * the page for on-screen preview regardless of delivery.
 *
 * Mirrors the "{Company} via Leap" sender identity used by
 * incentives-service's Resend templates.
 */

export interface SendResult {
  sent: boolean
  id?: string
  reason?: string
}

const FROM = "Comet via Leap <onboarding@resend.dev>"

export async function sendConfirmationEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set — rendering the confirmation email only (no delivery). " +
        "Set RESEND_API_KEY (Vercel sensitive var) to enable real sends.",
    )
    return { sent: false, reason: "RESEND_API_KEY not configured" }
  }
  if (!params.to) {
    return { sent: false, reason: "No recipient email provided" }
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
    if (error) {
      console.error("[email] Resend send failed:", error)
      return { sent: false, reason: error.message ?? "Resend error" }
    }
    return { sent: true, id: data?.id }
  } catch (err) {
    console.error("[email] Unexpected error sending confirmation email:", err)
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unexpected send error",
    }
  }
}
