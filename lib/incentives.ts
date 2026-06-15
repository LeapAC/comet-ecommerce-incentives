// Incentives — single source of truth for per-product programs.
// Ported from the Comet design system's incentives.jsx.

export type ProgramType = "instant" | "rebate" | "vpp"

export interface Program {
  type: ProgramType
  name: string
  amount: number
  sub: string
}

export interface ProgramMeta {
  label: string
  /** Tailwind class for the amount color */
  colorClass: string
  /** Tailwind class for the icon well background */
  bgClass: string
  icon: "Zap" | "Gift" | "Leaf"
  when: string
  tag: string
  blurb: string
}

export const PROGRAM_META: Record<ProgramType, ProgramMeta> = {
  instant: {
    label: "Instant checkout credit",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    icon: "Zap",
    when: "At checkout",
    tag: "Upfront",
    blurb:
      "Applied as an upfront discount on your order total — advanced instantly by Leap, no waiting.",
  },
  rebate: {
    label: "Rebate after install",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    icon: "Gift",
    when: "After install",
    tag: "Post-purchase",
    blurb:
      "Paid back to you once your charger is installed and verified. Comet files the paperwork for you.",
  },
  vpp: {
    label: "Virtual Power Plant",
    colorClass: "text-violet-600",
    bgClass: "bg-violet-50",
    icon: "Leaf",
    when: "Every year",
    tag: "Earn yearly",
    blurb:
      "Earn every year by letting your charger return stored energy to the grid during peak demand events.",
  },
}

// Per-product programs.
// 1 Home Pro: full stack  · 2 Compact: rebate only  · 3 Business: instant + VPP
// 4 Ultra: full stack (premium)  · 5 Splitter: none
export const PROGRAMS: Record<number, Program[]> = {
  1: [
    { type: "instant", name: "Instant Checkout Credit", amount: 350, sub: "Leap revenue advance" },
    { type: "rebate", name: "PG&E Residential Charging Rebate", amount: 270, sub: "50% of hardware, after install" },
    { type: "vpp", name: "Comet Virtual Power Plant", amount: 300, sub: "Avg. annual earnings" },
  ],
  2: [
    { type: "rebate", name: "PG&E Residential Charging Rebate", amount: 180, sub: "50% of hardware, after install" },
  ],
  3: [
    { type: "instant", name: "Instant Checkout Credit", amount: 350, sub: "Leap revenue advance" },
    { type: "vpp", name: "Commercial VPP — Fleet Demand Response", amount: 480, sub: "Avg. annual earnings per port" },
  ],
  4: [
    { type: "instant", name: "Instant Checkout Credit", amount: 350, sub: "Leap revenue advance" },
    { type: "rebate", name: "Federal + State EV Charger Rebate", amount: 480, sub: "30C credit + state top-up" },
    { type: "vpp", name: "Comet Virtual Power Plant", amount: 360, sub: "Avg. annual earnings" },
  ],
  5: [],
}

export interface IncentiveComputed {
  programs: Program[]
  instant: number
  rebate: number
  vpp: number
  payToday: number
  net: number
  oneTimeBack: number
  hasAny: boolean
}

export function computeIncentives(productId: number, price: number): IncentiveComputed {
  const programs = PROGRAMS[productId] ?? []
  const sum = (t: ProgramType) =>
    programs.filter((x) => x.type === t).reduce((a, b) => a + b.amount, 0)
  const instant = Math.min(sum("instant"), price)
  const rebate = sum("rebate")
  const vpp = sum("vpp")
  const payToday = Math.max(0, price - instant)
  const net = Math.max(0, payToday - rebate)
  const oneTimeBack = instant + rebate
  return { programs, instant, rebate, vpp, payToday, net, oneTimeBack, hasAny: programs.length > 0 }
}

export function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString()
}
