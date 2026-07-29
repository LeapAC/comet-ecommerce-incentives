"use client"

import { useEffect, useMemo, useRef } from "react"
import { Gift, Leaf } from "@/components/ui/lucide-icons"
import { useCart } from "@/lib/cart-context"
import { useIncentives } from "@/lib/incentives/context"
import { cartToDevices } from "@/lib/incentives/cart"
import { usd } from "@/lib/incentives/model"

/**
 * Compact incentive summary for the cart drawer. Surfaces the savings story at
 * the cart step too — either the live "you qualify for $X" once an address is
 * known, or a teaser prompting the shopper to add one at checkout.
 *
 * `active` gates the (address-dependent) lookup to when the drawer is open.
 */
export function CartIncentiveSummary({ active }: { active: boolean }) {
  const { state } = useCart()
  const { applied, address, results, lookup } = useIncentives()

  const devices = useMemo(() => cartToDevices(state.items), [state.items])
  const key = "cart"
  const st = results[key]
  const view = st?.status === "done" ? st.view : undefined

  // Re-run the lookup whenever the address OR the cart contents change — guarding
  // on `!st` alone left the summary stale when the cart was edited (qty bumped,
  // item added/removed) while the drawer stayed open. Track a device+address
  // signature and re-run when it changes, matching app/checkout/page.tsx.
  const deviceSig = devices.map((d) => `${d.deviceId}:${d.ref}`).join("|")
  const lastRun = useRef("")
  useEffect(() => {
    if (!active || !applied || devices.length === 0) return
    const addrSig = address ? `${address.line1}|${address.city}|${address.state}|${address.zip}` : ""
    const sig = `${addrSig}::${deviceSig}`
    if (lastRun.current === sig) return
    lastRun.current = sig
    lookup(key, devices, { referenceId: "comet-cart-preview" })
  }, [active, applied, address, deviceSig, devices, lookup])

  if (state.items.length === 0) return null

  // No address yet — teaser so the savings story is present at the cart step.
  if (!applied) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Gift className="h-4 w-4" />
        </span>
        <p className="text-[13px] leading-snug text-foreground/80">
          <span className="font-semibold text-foreground">Rebates &amp; VPP earnings available.</span>{" "}
          Add your address at checkout to see what you qualify for.
        </p>
      </div>
    )
  }

  if (st?.status === "loading" || !st) {
    return (
      <div className="h-[52px] animate-pulse rounded-xl border border-emerald-200/60 bg-emerald-50/50" />
    )
  }

  if (!view?.eligible) return null

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-violet-50/60 px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            You qualify for
          </p>
          <p className="text-sm font-semibold text-foreground">
            <span className="tnum text-emerald-700">{usd(view.oneTimeBack)}</span> back after purchase
          </p>
        </div>
        {view.ongoingAmount > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
            <Leaf className="h-3 w-3" />
            <span className="tnum">+{usd(view.ongoingAmount)}/yr</span>
          </span>
        )}
      </div>
    </div>
  )
}
