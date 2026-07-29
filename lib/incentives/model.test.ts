import { describe, it, expect } from "vitest"

import { toIncentiveView } from "./model"
import type { EligibilityResult, MatchedTier } from "@/lib/leap/types"

function tier(payment_type: MatchedTier["payment_type"], amount: number): MatchedTier {
  return {
    tier_name: `${payment_type}-tier`,
    payment_type,
    incentive_amount: amount,
    device_results: [],
  }
}

function result(partial: {
  upfront: number
  install: number
  ongoing: number
  tiers: MatchedTier[]
}): EligibilityResult {
  return {
    reference_id: "ref-1",
    customer_classification: "RESIDENTIAL",
    customer_devices: [],
    connect_url: "https://connect.example/x",
    incentive_summary: {
      upfront_amount: partial.upfront,
      install_amount: partial.install,
      ongoing_amount: partial.ongoing,
    },
    utilities: { primary: { eiaid: "1", name: "Test Utility" }, possible_utilities: [] },
    program_details: [
      { name: "Test Program", tiers: partial.tiers },
    ],
  }
}

describe("toIncentiveView — UPFRONT is a checkout discount, not post-purchase money", () => {
  const view = toIncentiveView(
    result({
      upfront: 100,
      install: 215,
      ongoing: 55,
      tiers: [tier("UPFRONT", 100), tier("INSTALL", 215), tier("ONGOING", 55)],
    }),
  )

  it("keeps upfront separate from oneTimeBack", () => {
    expect(view.upfrontAmount).toBe(100)
    expect(view.installAmount).toBe(215)
    // oneTimeBack must be INSTALL only — NOT install + upfront.
    expect(view.oneTimeBack).toBe(215)
    expect(view.oneTimeBack).not.toBe(315)
  })

  it("keeps ongoing fully separate", () => {
    expect(view.ongoingAmount).toBe(55)
  })

  it("labels the UPFRONT program row as an at-checkout ('upfront') credit", () => {
    const upfrontRow = view.programs.find((p) => p.when === "upfront")
    expect(upfrontRow?.amount).toBe(100)
    const installRow = view.programs.find((p) => p.when === "install")
    expect(installRow?.amount).toBe(215)
    const ongoingRow = view.programs.find((p) => p.when === "ongoing")
    expect(ongoingRow?.amount).toBe(55)
  })

  it("is eligible when programs are present", () => {
    expect(view.eligible).toBe(true)
  })
})

describe("toIncentiveView — live path (upfront = 0)", () => {
  it("oneTimeBack equals installAmount and there is no upfront row", () => {
    const view = toIncentiveView(
      result({
        upfront: 0,
        install: 361.73,
        ongoing: 55.02,
        tiers: [tier("INSTALL", 215), tier("INSTALL", 146.73), tier("ONGOING", 55.02)],
      }),
    )
    expect(view.upfrontAmount).toBe(0)
    expect(view.oneTimeBack).toBe(361.73)
    expect(view.programs.some((p) => p.when === "upfront")).toBe(false)
  })
})
