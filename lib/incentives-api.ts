// Types from the Global Connect OpenAPI spec (incentives.yaml)
// Used by the server-side API route and the client-side context.

export interface EligibilityRequest {
  reference_id: string
  address: {
    address_line_1: string
    city: string
    state: string
    zip_code: string
  }
  customer_devices: {
    device_id: string
    partner_device_reference?: string
  }[]
  customer_classification: "RESIDENTIAL" | "COMMERCIAL"
}

export interface EligibilityResult {
  reference_id: string
  incentive_summary: {
    upfront_amount: number
    install_amount: number
    ongoing_amount: number
  }
  program_details: {
    name: string
    operator_name?: string | null
    device_category?: string | null
    tiers: {
      tier_name: string
      payment_type: "UPFRONT" | "INSTALL" | "ONGOING"
      incentive_amount: number
    }[]
  }[]
  connect_url: string
}

// Converts a live API result into the same IncentiveComputed shape that the
// rest of the UI already knows how to render. Falls back gracefully when the
// API returns empty program_details (no coverage at this address).
import type { IncentiveComputed, Program, ProgramType } from "./incentives"

export function computeIncentivesFromApi(
  result: EligibilityResult,
  price: number
): IncentiveComputed {
  const programs: Program[] = []

  for (const prog of result.program_details) {
    for (const tier of prog.tiers) {
      if (tier.incentive_amount <= 0) continue
      const type: ProgramType =
        tier.payment_type === "ONGOING"
          ? "vpp"
          : tier.payment_type === "UPFRONT"
          ? "instant"
          : "rebate"
      programs.push({
        type,
        name: prog.name,
        amount: tier.incentive_amount,
        sub: prog.operator_name ?? "",
      })
    }
  }

  const sum = (t: ProgramType) =>
    programs.filter((p) => p.type === t).reduce((a, p) => a + p.amount, 0)

  const instant = Math.min(sum("instant"), price)
  const rebate = sum("rebate")
  const vpp = sum("vpp")
  const payToday = Math.max(0, price - instant)
  const net = Math.max(0, payToday - rebate)
  const oneTimeBack = instant + rebate

  return { programs, instant, rebate, vpp, payToday, net, oneTimeBack, hasAny: programs.length > 0 }
}
