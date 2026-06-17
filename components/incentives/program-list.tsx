"use client"

import { computeIncentives, PROGRAM_META, usd } from "@/lib/incentives"
import { computeIncentivesFromApi } from "@/lib/incentives-api"
import { useZip } from "@/lib/zip-context"
import { Zap, Gift, Leaf, Info } from "@/components/ui/lucide-icons"

const ICONS = { Zap, Gift, Leaf }

interface ProgramListProps {
  productId: number
  price: number
  zip: string
}

export function ProgramList({ productId, price, zip }: ProgramListProps) {
  const { incentivesCache, isFetching } = useZip()

  const apiResult = incentivesCache[productId]
  const loading = isFetching[productId]

  const c =
    apiResult != null
      ? computeIncentivesFromApi(apiResult, price)
      : computeIncentives(productId, price)

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!c.hasAny) {
    return (
      <div className="flex gap-3 p-4 rounded-xl border bg-card text-sm text-muted-foreground">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <span>
          No incentive programs are currently available for this product in {zip}. Check back
          as programs are added regularly.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {c.programs.map((pg, i) => {
        const meta = PROGRAM_META[pg.type]
        const IconComponent = ICONS[meta.icon]
        const amount =
          pg.type === "vpp"
            ? usd(pg.amount) + "/yr"
            : (pg.type === "instant" ? "−" : "+") + usd(pg.amount)

        return (
          <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card">
            <span
              className={`w-10 h-10 rounded-full shrink-0 inline-flex items-center justify-center ${meta.bgClass} ${meta.colorClass}`}
            >
              <IconComponent className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-foreground text-sm">{pg.name}</span>
                <span className={`font-bold text-sm whitespace-nowrap ${meta.colorClass}`}>
                  {amount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{meta.blurb}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.bgClass} ${meta.colorClass}`}
                >
                  {meta.tag}
                </span>
                <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {meta.when}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
