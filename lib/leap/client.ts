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

/**
 * Bounded timeout for the upstream lookup. Without it, a slow/unreachable Leap
 * API would leave the PDP/checkout stuck in the loading state until the platform
 * function timeout — the UI's error/retry state would never be reached.
 */
const LOOKUP_TIMEOUT_MS = 10_000

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

/** Extract a human-readable message from an error body, coercing non-string
 *  `error`/`message` fields (the gateway sometimes returns a structured object)
 *  so callers never see `"[object Object]"`. */
function errorMessage(
  body: LeapErrorResponse,
  text: string,
  status: number,
): string {
  const candidate = body.error ?? body.message
  if (typeof candidate === "string" && candidate.trim()) return candidate
  if (candidate != null) {
    try {
      return JSON.stringify(candidate)
    } catch {
      /* fall through */
    }
  }
  return text?.trim() || `Leap API returned ${status}`
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
  // Resolve config first so a missing env surfaces as a config_error, not a
  // spurious network_error from inside the try/catch below.
  const url = `${baseUrl()}${LOOKUP_PATH}`
  const authorization = `Bearer ${apiKey()}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      // Incentive results depend on live utility/program data — never cache.
      cache: "no-store",
      signal: controller.signal,
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
      throw new LeapApiError(
        code,
        errorMessage(body, text, res.status),
        res.status,
        body.details,
      )
    }

    return JSON.parse(text) as EligibilityResult
  } catch (err) {
    // Preserve typed errors (non-2xx mapping above).
    if (err instanceof LeapApiError) throw err
    // Timeout (our abort) vs. any other network/transport failure.
    if (controller.signal.aborted || (err as { name?: string })?.name === "AbortError") {
      throw new LeapApiError(
        "timeout",
        `Leap API request timed out after ${LOOKUP_TIMEOUT_MS}ms`,
        504,
      )
    }
    throw new LeapApiError(
      "network_error",
      err instanceof Error ? err.message : "Network error reaching the Leap API",
      502,
    )
  } finally {
    clearTimeout(timer)
  }
}
