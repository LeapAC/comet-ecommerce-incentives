"use client"

import { Gift, Leaf, Info, ArrowRight } from "@/components/ui/lucide-icons"
import { usd, type IncentiveView, type IncentiveWhen } from "@/lib/incentives/model"

const WHEN_META: Record<
  IncentiveWhen,
  { label: string; color: string; bg: string; Icon: typeof Gift }
> = {
  install: { label: "After install", color: "text-emerald-700", bg: "bg-emerald-50", Icon: Gift },
  upfront: { label: "At checkout", color: "text-emerald-700", bg: "bg-emerald-50", Icon: Gift },
  ongoing: { label: "Every year", color: "text-violet-600", bg: "bg-violet-50", Icon: Leaf },
}

function PoweredByLeap() {
  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-2 border-t bg-muted/20">
      <svg className="h-3 w-3 opacity-40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span className="text-[10px] text-muted-foreground">
        Incentives by <span className="font-semibold text-foreground">Leap</span>
        {" · Federal · State · Utility · VPP"}
      </span>
    </div>
  )
}

/**
 * Renders a normalized {@link IncentiveView} — the shared card used on the PDP
 * and in checkout. `variant="compact"` drops the per-program breakdown.
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
      <div className="flex gap-3 p-4 rounded-xl border bg-card text-sm text-muted-foreground">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <span>
          No incentive programs are available for this item
          {view.utilityName ? ` in ${view.utilityName} territory` : " at this address"}.
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-card">
      {/* Headline */}
      <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-violet-50 border-b">
        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-widest">
          Money back available
        </p>
        <p className="text-[22px] font-bold text-foreground leading-tight mt-0.5">
          {view.upfrontAmount > 0 && <>{usd(view.upfrontAmount)} off at checkout</>}
          {view.oneTimeBack > 0 && (
            <>
              {view.upfrontAmount > 0 ? " · " : ""}
              {usd(view.oneTimeBack)} back after purchase
            </>
          )}
          {view.oneTimeBack === 0 && view.upfrontAmount === 0 && view.ongoingAmount > 0 && (
            <>{usd(view.ongoingAmount)}/yr in earnings</>
          )}
          {view.ongoingAmount > 0 && (view.oneTimeBack > 0 || view.upfrontAmount > 0) && (
            <span className="text-violet-600 font-semibold text-base">
              {" "}
              + {usd(view.ongoingAmount)}/yr
            </span>
          )}
        </p>
        {view.utilityName && (
          <p className="text-sm text-foreground/70 mt-1">
            Programs from {view.utilityName}, filed for you by Comet after purchase.
          </p>
        )}
      </div>

      {/* Program rows */}
      {variant === "full" && (
        <div className="p-4 flex flex-col gap-3">
          {view.programs.map((pg, i) => {
            const meta = WHEN_META[pg.when]
            const amount =
              (pg.when === "ongoing" ? usd(pg.amount) + "/yr" : "+" + usd(pg.amount))
            return (
              <div key={i} className="flex gap-3 p-3 rounded-xl border bg-white">
                <span
                  className={`w-9 h-9 rounded-full shrink-0 inline-flex items-center justify-center ${meta.bg} ${meta.color}`}
                >
                  <meta.Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-foreground text-sm">{pg.name}</span>
                    <span className={`font-bold text-sm whitespace-nowrap ${meta.color}`}>
                      {amount}
                    </span>
                  </div>
                  {pg.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pg.description}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>
            )
          })}

          {view.connectUrl && (
            <a
              href={view.connectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline pt-1"
            >
              See how you get paid
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      <PoweredByLeap />
    </div>
  )
}
