"use client"

import { computeIncentives, usd } from "@/lib/incentives"
import { Gift, Leaf } from "@/components/ui/lucide-icons"

interface PriceBreakdownProps {
  productId: number
  price: number
}

export function PriceBreakdown({ productId, price }: PriceBreakdownProps) {
  const c = computeIncentives(productId, price)

  if (!c.hasAny) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-primary">{usd(price)}</span>
        <span className="text-xs text-muted-foreground">No incentives available in your area</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden text-sm">
      {/* You pay today */}
      <div className="px-3 py-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">You pay today</span>
          <span className="flex items-baseline gap-1.5">
            {c.instant > 0 && (
              <span className="text-[13px] text-muted-foreground line-through">{usd(price)}</span>
            )}
            <span className="text-[22px] font-bold text-foreground">{usd(c.payToday)}</span>
          </span>
        </div>
        {c.instant > 0 && (
          <p className="text-[11px] text-right mt-0.5 text-emerald-700">
            incl. {usd(c.instant)} instant credit at checkout
          </p>
        )}
      </div>

      {/* Rebate row */}
      {c.rebate > 0 && (
        <div className="px-3 py-2.5 border-t bg-emerald-50">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] text-foreground/80">
              <Gift className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              Rebate after install
            </span>
            <span className="text-[13px] font-semibold text-emerald-700">−{usd(c.rebate)}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[13px] font-bold text-foreground">Net cost</span>
            <span className="text-[18px] font-bold text-emerald-700">≈ {usd(c.net)}</span>
          </div>
        </div>
      )}

      {/* VPP row */}
      {c.vpp > 0 && (
        <div className="px-3 py-1.5 border-t bg-violet-50 flex items-center gap-1.5">
          <Leaf className="h-3 w-3 text-violet-600 shrink-0" />
          <span className="text-[12px] font-medium text-violet-600">
            Plus earn {usd(c.vpp)}/yr with VPP
          </span>
        </div>
      )}
    </div>
  )
}
