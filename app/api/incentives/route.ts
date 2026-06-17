import { NextRequest, NextResponse } from "next/server"
import { zipToState } from "@/lib/zip-utils"
import { PRODUCTS } from "@/lib/products"
import type { Address } from "@/lib/zip-context"
import type { EligibilityRequest } from "@/lib/incentives-api"

const BASE_URL = process.env.LEAP_API_URL ?? "https://api.leap.energy"
const API_KEY = process.env.LEAP_API_KEY ?? process.env.LEAP_API_TOKEN ?? ""
const GOOGLE_KEY = process.env.GOOGLE_ADDRESS_API_KEY ?? ""

type Component = { types: string[]; longText: string; shortText: string }

/** Geocode a ZIP to city/state using the Places (New) text search API. */
async function geocodeZip(zip: string): Promise<{ line1: string; city: string; state: string } | null> {
  if (!GOOGLE_KEY) return null
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": "places.addressComponents",
      },
      body: JSON.stringify({ textQuery: `${zip} USA` }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const components: Component[] = data.places?.[0]?.addressComponents ?? []
    if (!components.length) return null

    const pick = (type: string, useLong = true) =>
      components.find((c) => c.types.includes(type))?.[useLong ? "longText" : "shortText"] ?? ""

    const city =
      pick("locality") ||
      pick("sublocality") ||
      pick("administrative_area_level_3") ||
      pick("administrative_area_level_2")
    const state = pick("administrative_area_level_1", false)

    return { line1: "1 Main St", city, state }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { zip, address, productId } = (await req.json()) as {
    zip: string
    address: Address | null
    productId: number
  }

  if (!zip || !productId) {
    return NextResponse.json({ error: "zip and productId are required" }, { status: 400 })
  }

  const product = PRODUCTS.find((p) => p.id === Number(productId))
  if (!product) {
    return NextResponse.json({ error: "unknown_product" }, { status: 404 })
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }

  // Use the full address from Google Places if available; otherwise geocode from ZIP.
  let resolvedAddress: { line1: string; city: string; state: string }
  if (address?.city && address?.state) {
    resolvedAddress = { line1: address.line1, city: address.city, state: address.state }
  } else {
    resolvedAddress = (await geocodeZip(zip)) ?? {
      line1: "1 Main St",
      city: "",
      state: zipToState(zip),
    }
  }

  const body: EligibilityRequest = {
    reference_id: `comet-${zip}-${productId}`,
    address: {
      address_line_1: resolvedAddress.line1,
      city: resolvedAddress.city,
      state: resolvedAddress.state,
      zip_code: zip,
    },
    customer_devices: [{ device_id: product.deviceUuid, partner_device_reference: "1" }],
    customer_classification: "RESIDENTIAL",
  }

  try {
    const res = await fetch(`${BASE_URL}/v1.1/global-connect/incentives/lookups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
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
