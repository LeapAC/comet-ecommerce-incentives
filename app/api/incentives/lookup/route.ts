import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { lookupIncentives, LeapApiError } from "@/lib/leap/client"
import { toIncentiveView } from "@/lib/incentives/model"
import type {
  CustomerClassification,
  CustomerDeviceRef,
  EligibilityRequest,
} from "@/lib/leap/types"

export const runtime = "nodejs"
// Incentive results depend on live utility data; never statically cache.
export const dynamic = "force-dynamic"

interface LookupBody {
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
  }
  devices?: Array<{ deviceId?: string; ref?: string }>
  referenceId?: string
  classification?: CustomerClassification
  customerDetails?: Record<string, string>
}

/** Error codes that mean "the address/area simply has no incentives" — not a
 *  failure. We surface these as an empty-but-successful result so the UI can
 *  show a friendly "no incentives here" state instead of an error. */
const NO_INCENTIVE_CODES = new Set([
  "no_utility_at_address",
  "NO_UTILITY_AT_ADDRESS",
  "address_not_geocodable",
  "ADDRESS_NOT_GEOCODABLE",
  "no_valid_eiaid",
])

export async function POST(request: Request) {
  let body: LookupBody
  try {
    body = (await request.json()) as LookupBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const addr = body.address ?? {}
  const missing = (["line1", "city", "state", "zip"] as const).filter(
    (k) => !addr[k]?.trim(),
  )
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing address fields: ${missing.join(", ")}` },
      { status: 400 },
    )
  }

  const devices: CustomerDeviceRef[] = (body.devices ?? [])
    .filter((d) => d.deviceId)
    .map((d, i) => ({
      device_id: d.deviceId as string,
      partner_device_reference: d.ref ?? String(i + 1),
    }))
  if (devices.length === 0) {
    return NextResponse.json(
      { error: "At least one device with a deviceId is required" },
      { status: 400 },
    )
  }

  const leapRequest: EligibilityRequest = {
    // A fresh reference_id per preview keeps demo lookups isolated. Checkout
    // passes a stable order id so its connect_url / claim flow is durable.
    reference_id: body.referenceId?.trim() || `comet-preview-${randomUUID()}`,
    address: {
      address_line_1: addr.line1!.trim(),
      address_line_2: addr.line2?.trim() || undefined,
      city: addr.city!.trim(),
      state: addr.state!.trim().toUpperCase(),
      zip_code: addr.zip!.trim(),
      country_code: "US",
    },
    customer_devices: devices,
    customer_classification: body.classification ?? "RESIDENTIAL",
    customer_details: body.customerDetails,
  }

  try {
    const result = await lookupIncentives(leapRequest)
    return NextResponse.json(toIncentiveView(result))
  } catch (err) {
    if (err instanceof LeapApiError) {
      if (NO_INCENTIVE_CODES.has(err.code)) {
        return NextResponse.json({
          eligible: false,
          installAmount: 0,
          ongoingAmount: 0,
          upfrontAmount: 0,
          oneTimeBack: 0,
          programs: [],
          utilityName: null,
          connectUrl: null,
          referenceId: leapRequest.reference_id,
          notice:
            err.code === "no_utility_at_address"
              ? "We couldn't find a utility serving this address."
              : "We couldn't check incentives for this address.",
        })
      }
      console.error(`[incentives/lookup] Leap API error ${err.code}:`, err.message)
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      )
    }
    console.error("[incentives/lookup] Unexpected error:", err)
    return NextResponse.json(
      { error: "Unexpected error checking incentives." },
      { status: 500 },
    )
  }
}
