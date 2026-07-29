"use client"

import { Gift, Leaf, Zap, Info, Check } from "@/components/ui/lucide-icons"
import { usd, type IncentiveView, type IncentiveWhen } from "@/lib/incentives/model"

const WHEN_META: Record<
  IncentiveWhen,
  { label: string; color: string; bg: string; ring: string; Icon: typeof Gift; sign: string }
> = {
  install: {
    label: "Rebate after install",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    Icon: Gift,
    sign: "+",
  },
  upfront: {
    label: "Credit at checkout",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    Icon: Zap,
    sign: "−",
  },
  ongoing: {
    label: "Earns every year",
    color: "text-violet-700",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    Icon: Leaf,
    sign: "+",
  },
}

function LeapMark() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

/**
 * The shared incentive card — used on the PDP, in checkout, and on the
 * confirmation page. Leads with the money ("$X back") so the eligibility story
 * reads instantly, then breaks down the programs and how they're handled.
 */
export function IncentiveResults({
  view,
  variant = "full",
}: {
  view: IncentiveView
  variant?: "full" | "compact"
}) {
  if (!view.eligible) {
    return (
      <div className="flex gap-3 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <span>
          No incentive programs are available for this item
          {view.utilityName ? ` in ${view.utilityName} territory` : " at this address"}.
        </span>
      </div>
    )
  }

  const heroValue = view.oneTimeBack > 0 ? view.oneTimeBack : view.upfrontAmount
  const heroLabel = view.oneTimeBack > 0 ? "back after purchase" : "off at checkout"

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Hero — lead with the money */}
      <div className="relative border-b bg-gradient-to-br from-emerald-50 via-card to-violet-50 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              You qualify for
            </p>
            <p className="tnum mt-1 text-[40px] font-bold leading-none text-emerald-700">
              {usd(heroValue)}
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground/70">
              {heroLabel}
              {view.oneTimeBack > 0 && view.upfrontAmount > 0 && (
                <> · {usd(view.upfrontAmount)} off at checkout</>
              )}
            </p>
          </div>
          {view.ongoingAmount > 0 && (
            <div className="shrink-0 rounded-xl bg-violet-100/70 px-3.5 py-2.5 text-center ring-1 ring-violet-200/60">
              <p className="tnum text-xl font-bold leading-none text-violet-700">
                +{usd(view.ongoingAmount)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-violet-700/80">/yr with VPP</p>
            </div>
          )}
        </div>
        {view.utilityName && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            via {view.utilityName}
          </span>
        )}
      </div>

      {/* Program breakdown */}
      {variant === "full" && (
        <div className="space-y-2.5 p-4">
          {view.programs.map((pg, i) => {
            const meta = WHEN_META[pg.when]
            const amount =
              pg.when === "ongoing"
                ? `+${usd(pg.amount)}/yr`
                : `${meta.sign}${usd(pg.amount)}`
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}
                >
                  <meta.Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{pg.name}</p>
                  <p className={`text-xs font-medium ${meta.color}`}>{meta.label}</p>
                </div>
                <span className={`tnum shrink-0 text-sm font-bold ${meta.color}`}>{amount}</span>
              </div>
            )
          })}

          {/* Clear info element (replaces the old "see how you get paid" CTA) */}
          <div className="mt-1 flex items-start gap-2.5 rounded-xl bg-muted/60 px-3.5 py-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-[13px] leading-snug text-muted-foreground">
              Comet files these
              {view.utilityName ? ` with ${view.utilityName}` : ""} for you after purchase — no
              forms to chase. Leap tracks each rebate through to payment.
            </p>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="flex items-center justify-center gap-1.5 border-t bg-muted/30 px-4 py-2 text-muted-foreground">
        <LeapMark />
        <span className="text-[10px] font-medium">
          Incentives by <span className="font-semibold text-foreground">Leap</span>
          {" · Federal · State · Utility · VPP"}
        </span>
      </div>
    </div>
  )
}
