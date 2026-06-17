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
      "Paid back to you once your device is installed and verified. Comet files the paperwork for you.",
  },
  vpp: {
    label: "Virtual Power Plant",
    colorClass: "text-violet-600",
    bgClass: "bg-violet-50",
    icon: "Leaf",
    when: "Every year",
    tag: "Earn yearly",
    blurb:
      "Earn every year by letting your device respond to grid demand events — enrolled automatically through Comet.",
  },
}

// Fallback incentive programs per product ID.
// Used when the Leap API is not configured or returns an error.
export const PROGRAMS: Record<number, Program[]> = {
  // ── EV Chargers ───────────────────────────────────────────────────────────
  1: [ // Tesla Wall Connector ($450)
    { type: "instant", name: "Federal 30C EV Charger Credit", amount: 135, sub: "30% of hardware, advanced by Leap" },
    { type: "rebate", name: "Utility EV Charger Rebate", amount: 200, sub: "Estimated, after install" },
  ],
  2: [ // Wallbox Pulsar Plus ($749)
    { type: "instant", name: "Federal 30C EV Charger Credit", amount: 225, sub: "30% of hardware, advanced by Leap" },
    { type: "rebate", name: "Utility EV Charger Rebate", amount: 250, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 200, sub: "Avg. annual earnings" },
  ],
  3: [ // GM Energy PowerShift ($3,999)
    { type: "instant", name: "Federal 30C EV Charger Credit", amount: 1000, sub: "30% up to $1,000 cap, advanced by Leap" },
    { type: "rebate", name: "Bidirectional Charger Rebate", amount: 500, sub: "V2H premium, after install" },
    { type: "vpp", name: "Vehicle-to-Grid Earnings", amount: 450, sub: "Avg. annual earnings" },
  ],
  4: [ // Emporia Pro Level 2 ($599)
    { type: "instant", name: "Federal 30C EV Charger Credit", amount: 180, sub: "30% of hardware, advanced by Leap" },
    { type: "rebate", name: "Utility EV Charger Rebate", amount: 200, sub: "Estimated, after install" },
  ],
  5: [ // EVIQO EVIPOWER Gen2 ($399)
    { type: "instant", name: "Federal 30C EV Charger Credit", amount: 120, sub: "30% of hardware, advanced by Leap" },
    { type: "rebate", name: "Utility EV Charger Rebate", amount: 150, sub: "Estimated, after install" },
  ],
  // ── Smart Thermostats ─────────────────────────────────────────────────────
  6: [ // Mysa Smart Thermostat ($129)
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 50, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 75, sub: "Avg. annual earnings" },
  ],
  7: [ // Honeywell T9 ($149.99)
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 75, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 100, sub: "Avg. annual earnings" },
  ],
  8: [ // Carrier Smart Thermostat ($256.44)
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 100, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 120, sub: "Avg. annual earnings" },
  ],
  9: [ // ecobee3 ($199)
    { type: "instant", name: "Instant Thermostat Incentive", amount: 50, sub: "Advanced by Leap" },
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 75, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 150, sub: "Avg. annual earnings" },
  ],
  10: [ // ecobee4 ($249)
    { type: "instant", name: "Instant Thermostat Incentive", amount: 50, sub: "Advanced by Leap" },
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 75, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 150, sub: "Avg. annual earnings" },
  ],
  11: [ // Google Nest Thermostat ($99.99)
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 75, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 100, sub: "Avg. annual earnings" },
  ],
  12: [ // Google Nest Thermostat E ($169)
    { type: "rebate", name: "Smart Thermostat Rebate", amount: 75, sub: "Estimated, after install" },
    { type: "vpp", name: "Demand Response Enrollment", amount: 120, sub: "Avg. annual earnings" },
  ],
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
