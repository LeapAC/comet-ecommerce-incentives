import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

import { lookupIncentives, LeapApiError } from "./client"
import type { EligibilityRequest } from "./types"

const REQUEST: EligibilityRequest = {
  reference_id: "ref-1",
  address: {
    address_line_1: "123 Market St",
    city: "San Francisco",
    state: "CA",
    zip_code: "94103",
    country_code: "US",
  },
  customer_devices: [{ device_id: "dev-1", partner_device_reference: "1" }],
  customer_classification: "RESIDENTIAL",
}

beforeEach(() => {
  process.env.LEAP_API_BASE_URL = "https://api.staging.example"
  process.env.LEAP_API_KEY = "test-key"
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("lookupIncentives — timeout", () => {
  it("aborts a hanging request and surfaces a LeapApiError('timeout')", async () => {
    // fetch that only settles when its AbortSignal fires (i.e. it hangs).
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, opts: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = opts.signal as AbortSignal
          const fail = () => {
            const e = new Error("aborted") as Error & { name: string }
            e.name = "AbortError"
            reject(e)
          }
          if (signal.aborted) fail()
          else signal.addEventListener("abort", fail)
        })
      }),
    )

    vi.useFakeTimers()
    const promise = lookupIncentives(REQUEST)
    // Attach the rejection expectations BEFORE advancing timers so the eventual
    // rejection is never momentarily unhandled.
    const isLeapError = expect(promise).rejects.toBeInstanceOf(LeapApiError)
    const isTimeout = expect(promise).rejects.toMatchObject({ code: "timeout", status: 504 })

    // Advance past the 10s bound so the AbortController fires.
    await vi.advanceTimersByTimeAsync(10_000)

    await isLeapError
    await isTimeout
  })
})

describe("lookupIncentives — success and error mapping", () => {
  it("returns the parsed body on 200", async () => {
    const body = {
      reference_id: "ref-1",
      customer_classification: "RESIDENTIAL",
      customer_devices: [],
      connect_url: "https://connect.example/x",
      incentive_summary: { upfront_amount: 0, install_amount: 215, ongoing_amount: 0 },
      utilities: { primary: null, possible_utilities: [] },
      program_details: [],
    }
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
    )
    const result = await lookupIncentives(REQUEST)
    expect(result.incentive_summary.install_amount).toBe(215)
  })

  it("posts to the /beta/incentives/lookups path on the configured base URL", async () => {
    // Guards the REA-1042 / REA-1077 cutover: GCS dropped the old
    // `/v1.1/global-connect/incentives/lookups` route with no alias, so a
    // regression here is a production outage, not a redirect.
    const fetchMock = vi.fn(
      async (_url: string, _init: RequestInit) =>
        new Response(
          JSON.stringify({
            reference_id: "ref-1",
            customer_classification: "RESIDENTIAL",
            customer_devices: [],
            connect_url: "https://connect.example/x",
            incentive_summary: { upfront_amount: 0, install_amount: 0, ongoing_amount: 0 },
            utilities: { primary: null, possible_utilities: [] },
            program_details: [],
          }),
          { status: 200 },
        ),
    )
    vi.stubGlobal("fetch", fetchMock)

    await lookupIncentives(REQUEST)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.staging.example/beta/incentives/lookups")
    expect(url).not.toContain("/v1.1/global-connect")
    expect(init.method).toBe("POST")
  })

  it("maps a non-2xx body to a typed LeapApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: "No utility found", error_code: "no_utility_at_address" }),
            { status: 404 },
          ),
      ),
    )
    await expect(lookupIncentives(REQUEST)).rejects.toMatchObject({
      code: "no_utility_at_address",
      status: 404,
    })
  })
})
