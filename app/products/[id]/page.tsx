"use client"

import { use, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
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
} from "@/components/ui/lucide-icons"
import Link from "next/link"

function SpecChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex-1 flex flex-col gap-1 p-3 rounded-xl border bg-white">
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

  // Run the incentive lookup whenever we have a complete address and no cached
  // result for this product. Clearing the address wipes the cache (see context),
  // so a new address re-triggers automatically.
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between max-w-[1280px]">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-foreground">Comet</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/products" className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
              Products
            </Link>
            <CartDrawer />
          </nav>
          <MobileNav />
        </div>
      </header>

      <div className="container max-w-[1100px] py-7 pb-20">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-start">
          {/* Left: gallery + spec chips */}
          <div className="flex flex-col gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[380px] object-cover rounded-2xl shadow-lg"
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

            <h1 className="text-3xl font-bold text-foreground tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex text-primary">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </span>
              {product.rating} · {product.reviews} reviews
            </div>

            <p className="text-[15px] text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex flex-col gap-2">
              {product.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            {/* Price + savings teaser */}
            <div className="mt-1 flex items-baseline gap-3 flex-wrap">
              <span className="text-[30px] font-bold text-primary">{usd(product.price)}</span>
              {view?.eligible ? (
                <span className="text-sm font-medium text-emerald-700">
                  {usd(view.oneTimeBack)} back after purchase
                  {view.ongoingAmount > 0 && (
                    <span className="text-violet-600"> + {usd(view.ongoingAmount)}/yr</span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {applied ? "" : "See incentives below"}
                </span>
              )}
            </div>

            {/* Qty + add to cart */}
            <div className="flex gap-3 items-center mt-1">
              <div className="flex items-center gap-1 border rounded-xl p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[28px] text-center font-semibold text-foreground">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" className="flex-1 gap-2" onClick={addToCart}>
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
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

        {/* Incentives & programs — awareness surface */}
        <div className="mt-14">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Incentives &amp; programs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {applied
                ? `Live eligibility for this charger via the Leap Incentives API${
                    view?.utilityName ? ` — ${view.utilityName}` : ""
                  }.`
                : "Enter your address to see the programs available where you live."}
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl">
            <AddressPanel />

            {applied && (!state || state.status === "loading") && (
              <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground animate-pulse">
                Checking incentives for your address…
              </div>
            )}
            {state?.status === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
                <span>Couldn&apos;t check incentives: {state.error}</span>
                <button
                  onClick={() => lookup(cacheKey, [{ deviceId: product.deviceId }])}
                  className="font-medium underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
            {view && <IncentiveResults view={view} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 mt-8">
        <div className="container max-w-[1280px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Comet</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Reference implementation · Incentives powered by the Leap Incentives API
          </p>
          <span className="text-sm text-muted-foreground">© 2026 Comet</span>
        </div>
      </footer>
    </div>
  )
}
