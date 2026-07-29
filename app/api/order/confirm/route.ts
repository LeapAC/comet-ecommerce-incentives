import { NextResponse } from "next/server"

import { renderConfirmationPreview } from "@/lib/email/leap-template"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface ConfirmBody {
  customerName?: string
  orderId?: string
  oneTimeBack?: number
  utilityName?: string | null
  programName?: string | null
}

/**
 * POST /api/order/confirm
 *
 * PREVIEW ONLY — renders the REAL Leap "information received" email (vendored
 * from connect-incentives/email-templates) with the order's data and returns it
 * as HTML for the confirmation page to display.
 *
 * There is intentionally NO send path. Comet is an open-source reference
 * partner; it cannot and must not send Leap's transactional emails. Leap owns
 * delivery on the partner's behalf (via Resend, from the incentives-service
 * `applications` edge function). This endpoint only shows the customer what the
 * real email looks like.
 */
export async function POST(request: Request) {
  let body: ConfirmBody
  try {
    body = (await request.json()) as ConfirmBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { subject, html } = renderConfirmationPreview({
    customerName: body.customerName?.trim() || "there",
    companyName: "Comet",
    utilityName: body.utilityName ?? null,
    oneTimeBack: Number(body.oneTimeBack) || 0,
    programName: body.programName ?? null,
    orderId: body.orderId?.trim() || "COMET-DEMO",
  })

  return NextResponse.json({ previewOnly: true, subject, html })
}
