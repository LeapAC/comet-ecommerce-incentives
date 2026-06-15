import { NextRequest, NextResponse } from "next/server"
import { zipToState } from "@/lib/zip-utils"
import type { EligibilityRequest } from "@/lib/incentives-api"

const BASE_URL = process.env.LEAP_API_URL ?? "https://api.staging.leap.energy"
const TOKEN = process.env.LEAP_API_TOKEN ?? ""

// Map storefront product IDs to Leap device catalog UUIDs.
// Populate via env vars once you have the device UUIDs from staging Supabase.
const DEVICE_IDS: Record<string, string> = {
  "1": process.env.LEAP_DEVICE_ID_HOME_PRO ?? "",
  "2": process.env.LEAP_DEVICE_ID_COMPACT ?? "",
  "3": process.env.LEAP_DEVICE_ID_BUSINESS ?? "",
  "4": process.env.LEAP_DEVICE_ID_ULTRA ?? "",
}

export async function POST(req: NextRequest) {
  const { zip, productId } = await req.json()

  if (!zip || !productId) {
    return NextResponse.json({ error: "zip and productId are required" }, { status: 400 })
  }

  const deviceId = DEVICE_IDS[String(productId)]
  if (!deviceId) {
    // Product has no device ID configured — not an error, just no API data
    return NextResponse.json({ error: "no_device_id" }, { status: 404 })
  }

  if (!TOKEN) {
    // Credentials not configured yet — caller will fall back to hardcoded data
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }

  const state = zipToState(zip)

  const body: EligibilityRequest = {
    // Unique per (zip, product, session) so re-lookups with the same ZIP reuse
    // the same customer record and avoid 409 REFERENCE_ID_CONFLICT.
    reference_id: `comet-${zip}-${productId}`,
    address: {
      address_line_1: "1 Main St",
      city: state, // placeholder — geocoder resolves from zip_code
      state,
      zip_code: zip,
    },
    customer_devices: [{ device_id: deviceId, partner_device_reference: "1" }],
    customer_classification: "RESIDENTIAL",
  }

  try {
    const res = await fetch(`${BASE_URL}/v1.1/global-connect/incentives/lookups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(body),
      // Don't let a slow upstream block the storefront for more than 8s
      signal: AbortSignal.timeout(8000),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
