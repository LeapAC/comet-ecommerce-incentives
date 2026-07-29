import { NextResponse } from "next/server"

import {
  renderConfirmationEmail,
  confirmationSubject,
  type ConfirmationEmailData,
} from "@/lib/email/confirmation-email"
import { sendConfirmationEmail } from "@/lib/email/send"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface ConfirmBody {
  email?: string
  customerName?: string
  orderId?: string
  items?: Array<{ name?: string; quantity?: number; price?: number }>
  oneTimeBack?: number
  ongoingAmount?: number
  utilityName?: string | null
  connectUrl?: string | null
}

/**
 * POST /api/order/confirm
 * Builds the confirmation email, attempts to send it via Resend (best-effort),
 * and returns the rendered HTML so the confirmation page can preview it — even
 * when delivery is disabled (no RESEND_API_KEY).
 */
export async function POST(request: Request) {
  let body: ConfirmBody
  try {
    body = (await request.json()) as ConfirmBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const data: ConfirmationEmailData = {
    customerName: body.customerName?.trim() || "there",
    orderId: body.orderId?.trim() || "COMET-DEMO",
    items: (body.items ?? []).map((it) => ({
      name: it.name ?? "Item",
      quantity: Math.max(1, Number(it.quantity) || 1),
      price: Number(it.price) || 0,
    })),
    oneTimeBack: Number(body.oneTimeBack) || 0,
    ongoingAmount: Number(body.ongoingAmount) || 0,
    utilityName: body.utilityName ?? null,
    connectUrl: body.connectUrl ?? null,
    companyName: "Comet",
  }

  const subject = confirmationSubject(data)
  const html = renderConfirmationEmail(data)

  const result = await sendConfirmationEmail({
    to: body.email?.trim() ?? "",
    subject,
    html,
  })

  return NextResponse.json({
    sent: result.sent,
    reason: result.reason,
    subject,
    html,
  })
}
