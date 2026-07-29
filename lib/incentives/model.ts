/**
 * Comet's display model for incentive results.
 *
 * The Leap API response ({@link EligibilityResult}) is normalized here into a
 * flat, presentational shape the PDP / checkout / confirmation surfaces render.
 * Keeping this mapping in one place means the UI never reaches into the raw API
 * envelope, and the two surfaces stay visually consistent.
 */

import type { EligibilityResult, PaymentType } from "@/lib/leap/types"

/** When a program's money reaches the customer. */
export type IncentiveWhen = "install" | "ongoing" | "upfront"

export interface DisplayProgram {
  name: string
  /** Total incentive across this program's tiers, in USD. */
  amount: number
  when: IncentiveWhen
  /** Utility / operator or partner-offer label, when present. */
  category?: string | null
  description?: string | null
}

export interface IncentiveView {
  eligible: boolean
  /** One-time money paid at install (post-purchase). */
  installAmount: number
  /** Recurring money, per year (e.g. VPP participation). */
  ongoingAmount: number
  /** Reserved pre-install kind — currently always 0 from the API. */
  upfrontAmount: number
  /** Total one-time money back after purchase (upfront + install). */
  oneTimeBack: number
  programs: DisplayProgram[]
  utilityName: string | null
  /** Deep link into the Leap Connect claim flow for this reference_id. */
  connectUrl: string | null
  referenceId: string
}

const WHEN_BY_PAYMENT: Record<PaymentType, IncentiveWhen> = {
  UPFRONT: "upfront",
  INSTALL: "install",
  ONGOING: "ongoing",
}

/**
 * Collapse each program's tiers into a single display row. A program can carry
 * tiers with different payment types (e.g. VPP enrollment at INSTALL +
 * participation ONGOING); we split those into separate rows so the "when" is
 * always truthful.
 */
export function toIncentiveView(result: EligibilityResult): IncentiveView {
  const summary = result.incentive_summary
  const programs: DisplayProgram[] = []

  for (const program of result.program_details ?? []) {
    const byWhen = new Map<IncentiveWhen, number>()
    for (const tier of program.tiers ?? []) {
      const when = WHEN_BY_PAYMENT[tier.payment_type] ?? "install"
      byWhen.set(when, (byWhen.get(when) ?? 0) + (tier.incentive_amount ?? 0))
    }
    for (const [when, amount] of byWhen) {
      if (amount <= 0) continue
      programs.push({
        name: program.name,
        amount,
        when,
        category: program.display_name ?? program.device_category ?? null,
        description: program.description ?? null,
      })
    }
  }

  // Order: one-time money first, then ongoing.
  programs.sort((a, b) => {
    const rank = (w: IncentiveWhen) => (w === "ongoing" ? 1 : 0)
    return rank(a.when) - rank(b.when) || b.amount - a.amount
  })

  const installAmount = summary?.install_amount ?? 0
  const ongoingAmount = summary?.ongoing_amount ?? 0
  const upfrontAmount = summary?.upfront_amount ?? 0

  return {
    eligible: programs.length > 0,
    installAmount,
    ongoingAmount,
    upfrontAmount,
    oneTimeBack: installAmount + upfrontAmount,
    programs,
    utilityName: result.utilities?.primary?.name ?? null,
    connectUrl: result.connect_url ?? null,
    referenceId: result.reference_id,
  }
}

export function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US")
}
