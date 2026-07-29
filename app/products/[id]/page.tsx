"use client"

import { use, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AddressPanel } from "@/components/incentives/address-panel"
import { IncentiveResults } from "@/components/incentives/incentive-results"
import { useCart } from "@/lib/cart-context"
import { useIncentives } from "@/lib/incentives/context"
import { PRODUCTS } from "@/lib/products"
import { usd } from "@/lib/incentives/model"
import { useToast } from "@/hooks/use-toast"
import {
  Zap,
  Shield,
  Check,
  Star,
  ArrowLeft,
  ShoppingCart,
  Truck,
  Plus,
  Minus,
  Gift,
} from "@/components/ui/lucide-icons"

function SpecChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border bg-card p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = PRODUCTS.find((p) => p.id === Number(id))
  if (!product) notFound()

  const { dispatch } = useCart()
  const { applied, address, results, lookup } = useIncentives()
  const { toast } = useToast()
  const [qty, setQty] = useState(1)

  const cacheKey = `pdp-${product.id}`
  const state = results[cacheKey]
  const view = state?.status === "done" ? state.view : undefined

  useEffect(() => {
    if (applied && !state) {
      lookup(cacheKey, [{ deviceId: product.deviceId }])
    }
  }, [applied, address, cacheKey, product.deviceId, state, lookup])

  const warranty =
    product.category === "Accessory" ? "2 Years" : product.category === "Home" ? "3 Years" : "5 Years"

  const addToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        },
      })
    }
    toast({ title: "Added to cart", description: `${qty}× ${product.name} added to your cart.` })
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container max-w-[1120px] py-8 pb-20">
        <Link
          href="/#products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to chargers
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Left: gallery + specs */}
          <div className="flex flex-col gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="h-[400px] w-full rounded-2xl border object-cover shadow-md"
            />
            <div className="flex gap-3">
              <SpecChip icon={<Zap className="h-3.5 w-3.5" />} label="Power" value={product.power} />
              <SpecChip icon={<Shield className="h-3.5 w-3.5" />} label="Connector" value={product.connector} />
              <SpecChip icon={<Check className="h-3.5 w-3.5" />} label="Warranty" value={warranty} />
            </div>
          </div>

          {/* Right: info + buy */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary">{product.badge}</Badge>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex text-primary">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </span>
              <span className="tnum">{product.rating}</span> · {product.reviews} reviews
            </div>

            <p className="text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="flex flex-col gap-2">
              {product.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {f}
                </div>
              ))}
            </div>

            {/* Price + eligibility */}
            <div className="mt-2 rounded-2xl border bg-card p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="tnum text-3xl font-bold text-foreground">{usd(product.price)}</span>
                  {product.originalPrice && (
                    <span className="tnum ml-2 text-sm text-muted-foreground line-through">
                      {usd(product.originalPrice)}
                    </span>
                  )}
                </div>
                {view?.eligible ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <Gift className="h-4 w-4" />
                    <span className="tnum">{usd(view.oneTimeBack)}</span> back
                    {view.ongoingAmount > 0 && (
                      <span className="tnum text-violet-700">+{usd(view.ongoingAmount)}/yr</span>
                    )}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {applied ? "" : "Incentives available →"}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-xl border p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="tnum min-w-7 text-center font-semibold text-foreground">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1 gap-2" onClick={addToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="flex gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Free shipping over $500
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> {warranty} warranty
              </span>
            </div>
          </div>
        </div>

        {/* Incentives — awareness */}
        <div className="mt-16 border-t pt-10">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Incentives &amp; programs</h2>
            <p className="mt-1.5 text-muted-foreground">
              {applied
                ? `Live eligibility for this charger via the Leap Incentives API${
                    view?.utilityName ? ` — ${view.utilityName}` : ""
                  }.`
                : "Enter your address to see the rebates and programs available where you live."}
            </p>
          </div>

          <div className="flex max-w-2xl flex-col gap-4">
            <AddressPanel />

            {applied && (!state || state.status === "loading") && (
              <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                Checking incentives for your address…
              </div>
            )}
            {state?.status === "error" && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>Couldn&apos;t check incentives: {state.error}</span>
                <button
                  onClick={() => lookup(cacheKey, [{ deviceId: product.deviceId }])}
                  className="shrink-0 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}
            {view && <IncentiveResults view={view} />}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
