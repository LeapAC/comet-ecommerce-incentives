import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.GOOGLE_ADDRESS_API_KEY ?? ""

type Component = { longText: string; shortText: string; types: string[] }

function pick(components: Component[], type: string, useLong = true) {
  return components.find((c) => c.types.includes(type))?.[useLong ? "longText" : "shortText"] ?? ""
}

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }

  const { searchParams } = req.nextUrl
  const action = searchParams.get("action")

  // ── Autocomplete (Places API v1) ──────────────────────────────────────────
  if (action === "autocomplete") {
    const input = searchParams.get("input") ?? ""
    if (input.length < 3) return NextResponse.json({ predictions: [] })

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({ input, includedRegionCodes: ["us"] }),
      signal: AbortSignal.timeout(5000),
    })

    const data = await res.json()

    return NextResponse.json({
      predictions: (data.suggestions ?? []).map(
        (s: { placePrediction: { placeId: string; text: { text: string } } }) => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text.text,
        })
      ),
    })
  }

  // ── Place Details (Places API v1) ─────────────────────────────────────────
  if (action === "details") {
    const placeId = searchParams.get("placeId") ?? ""
    if (!placeId) return NextResponse.json({ error: "missing_place_id" }, { status: 400 })

    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "id,addressComponents",
      },
      signal: AbortSignal.timeout(5000),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message ?? "places_error" }, { status: 400 })
    }

    const components: Component[] = data.addressComponents ?? []
    const streetNumber = pick(components, "street_number")
    const route = pick(components, "route", false) // short form: "Main St"
    const city =
      pick(components, "locality") ||
      pick(components, "sublocality") ||
      pick(components, "administrative_area_level_3") ||
      pick(components, "administrative_area_level_2")
    const state = pick(components, "administrative_area_level_1", false)
    const zip = pick(components, "postal_code")

    return NextResponse.json({
      line1: [streetNumber, route].filter(Boolean).join(" ") || "1 Main St",
      city,
      state,
      zip,
    })
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 })
}
