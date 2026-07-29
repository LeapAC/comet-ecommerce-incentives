import "server-only"

import type {
  EligibilityRequest,
  EligibilityResult,
  LeapErrorResponse,
} from "./types"

/**
 * Server-only client for the Leap Incentives partner lookup API.
 *
 * The partner API key never leaves the server — this module is imported only
 * by route handlers under `app/api/**`. `import "server-only"` makes the build
 * fail loudly if it is ever pulled into a client bundle.
 *
 * Auth is a partner bearer token: `Authorization: Bearer <LEAP_API_KEY>`.
 * (The gateway does not accept `x-api-key` for these routes.)
 */

const LOOKUP_PATH = "/v1.1/global-connect/incentives/lookups"

function baseUrl(): string {
  const url = process.env.LEAP_API_BASE_URL
  if (!url) {
    throw new LeapApiError(
      "config_error",
      "LEAP_API_BASE_URL is not set. Add it to .env.local (staging: https://api.staging.leap.energy).",
      500,
    )
  }
  return url.replace(/\/+$/, "")
}

function apiKey(): string {
  const key = process.env.LEAP_API_KEY
  if (!key) {
    throw new LeapApiError(
      "config_error",
      "LEAP_API_KEY is not set. Add the Comet partner key to .env.local.",
      500,
    )
  }
  return key
}

export class LeapApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = "LeapApiError"
  }
}

/**
 * Look up incentive eligibility for a customer address + one or more devices.
 * Throws {@link LeapApiError} on any non-2xx response so callers can branch on
 * `error.code` / `error.status`.
 */
export async function lookupIncentives(
  request: EligibilityRequest,
): Promise<EligibilityResult> {
  const res = await fetch(`${baseUrl()}${LOOKUP_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    // Incentive results depend on live utility/program data — never cache.
    cache: "no-store",
  })

  const text = await res.text()

  if (!res.ok) {
    let body: LeapErrorResponse = {}
    try {
      body = text ? (JSON.parse(text) as LeapErrorResponse) : {}
    } catch {
      // non-JSON error body — keep the raw text as the message
    }
    const code = body.error_code ?? body.code ?? `http_${res.status}`
    const message =
      body.error ?? body.message ?? text ?? `Leap API returned ${res.status}`
    throw new LeapApiError(code, message, res.status, body.details)
  }

  return JSON.parse(text) as EligibilityResult
}
