"use client"

import { use, useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import { PriceBreakdown } from "@/components/incentives/price-breakdown"
import { ProgramList } from "@/components/incentives/program-list"
import { AddressSearch } from "@/components/incentives/address-search"
import { useCart } from "@/lib/cart-context"
import { useZip } from "@/lib/zip-context"
import { PRODUCTS } from "@/lib/products"
import { computeIncentives, usd } from "@/lib/incentives"
import { computeIncentivesFromApi } from "@/lib/incentives-api"
import { useToast } from "@/hooks/use-toast"
import {
  Zap,
  Wifi,
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
  const { address, zip, applied, onApplyAddress, onClear, fetchIncentives, incentivesCache } = useZip()
  const { toast } = useToast()
  const [qty, setQty] = useState(1)

  // Fetch real incentive data from the Leap API when ZIP is applied.
  useEffect(() => {
    if (applied) fetchIncentives(product.id)
  }, [applied, product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const apiResult = incentivesCache[product.id]
  const c =
    apiResult != null
      ? computeIncentivesFromApi(apiResult, product.price)
      : computeIncentives(product.id, product.price)
  const warranty = product.category === "EV Charger" ? "3 Years" : "2 Years"

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
    toast({
      title: "Added to cart",
      description: `${qty}× ${product.name} added to your cart.`,
    })
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
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
            <CartDrawer />
          </nav>
          <MobileNav />
        </div>
      </header>

      <div className="container max-w-[1100px] py-7 pb-20">
        {/* Back link */}
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
              {product.power && (
                <SpecChip
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Power"
                  value={product.power}
                />
              )}
              {product.connector && (
                <SpecChip
                  icon={<Shield className="h-3.5 w-3.5" />}
                  label="Connector"
                  value={product.connector}
                />
              )}
              {product.compatibility && (
                <SpecChip
                  icon={<Wifi className="h-3.5 w-3.5" />}
                  label="Compatibility"
                  value={product.compatibility}
                />
              )}
              <SpecChip
                icon={<Check className="h-3.5 w-3.5" />}
                label="Warranty"
                value={warranty}
              />
            </div>
          </div>

          {/* Right: info + buy */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex gap-2">
              <Badge variant="secondary">{product.badge}</Badge>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex text-primary">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </span>
              {product.rating} · {product.reviews} reviews
            </div>

            {/* Description */}
            <p className="text-[15px] text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="flex flex-col gap-2">
              {product.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            {/* Price / incentive */}
            <div className="mt-1">
              {applied ? (
                <PriceBreakdown productId={product.id} price={product.price} />
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-[30px] font-bold text-primary">{usd(product.price)}</span>
                  {c.hasAny && (
                    <span className="text-sm font-medium text-emerald-700">
                      Save up to {usd(c.oneTimeBack)} — see incentives below
                    </span>
                  )}
                </div>
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

            {/* Trust signals */}
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

        {/* Incentives & programs section */}
        <div className="mt-14">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Incentives &amp; programs</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {applied ? (
                  <>
                    Available for this charger in {address?.city ?? zip}
                    {c.hasAny ? (
                      <>
                        {" "}— up to{" "}
                        <strong className="text-emerald-700">{usd(c.oneTimeBack)}</strong> back
                        {c.vpp > 0 && (
                          <>
                            {" "}plus{" "}
                            <strong className="text-violet-600">{usd(c.vpp)}/yr</strong>
                          </>
                        )}
                        .
                      </>
                    ) : (
                      "."
                    )}
                  </>
                ) : (
                  "Enter your ZIP to see the programs available where you live."
                )}
              </p>
            </div>
            {applied && (
              <button
                onClick={onClear}
                className="text-sm font-medium text-primary hover:underline"
              >
                Change address
              </button>
            )}
          </div>

          {!applied ? (
            c.hasAny ? (
              /* ── Teaser: locked savings + "Unlock savings" CTA ── */
              <div className="rounded-xl border border-emerald-200 overflow-hidden">
                {/* Header callout — gradient from emerald-50 to violet-50 */}
                <div className="flex items-center gap-5 px-6 py-5 bg-gradient-to-r from-emerald-50 to-violet-50">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-widest">
                      Money back available
                    </p>
                    <p className="text-[22px] font-bold text-foreground leading-tight mt-0.5">
                      Get up to {usd(c.oneTimeBack)} back on this charger
                      {c.vpp > 0 && (
                        <span className="text-violet-600 font-semibold text-base"> + {usd(c.vpp)}/yr</span>
                      )}
                    </p>
                    <p className="text-sm text-foreground/70 mt-1">
                      Paid back to you after purchase through local rebates &amp; programs. Enter your ZIP to see what you qualify for.
                    </p>
                  </div>
                </div>

                {/* Skeleton rows (locked preview) + unlock overlay */}
                <div className="relative bg-white">
                  {/* Ghost skeleton rows — no filter, just low-opacity placeholders */}
                  <div className="p-4 flex flex-col gap-3 opacity-30 select-none pointer-events-none">
                    {c.programs.map((pg, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
                        <div className="flex-1 h-3 rounded-full bg-slate-300" />
                        <div className="w-16 h-4 rounded bg-slate-400" />
                      </div>
                    ))}
                  </div>

                  {/* Frosted overlay with address search */}
                  <div className="absolute inset-0 flex items-center justify-center px-6 bg-white/70 backdrop-blur-[2px]">
                    <AddressSearch
                      onSelect={onApplyAddress}
                      placeholder="Enter your address to unlock savings"
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* ── No programs: simple prompt ── */
              <div className="flex gap-3 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <AddressSearch
                  onSelect={onApplyAddress}
                  placeholder="Enter your address"
                  className="flex-1"
                />
              </div>
            )
          ) : (
            <ProgramList productId={product.id} price={product.price} zip={zip} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-16">
        <div className="container max-w-[1280px]">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Comet</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Smart home energy devices — EV chargers, thermostats, and real-time incentive estimates.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Products</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/products" className="block hover:text-foreground transition-colors">EV Chargers</Link>
                <Link href="/products" className="block hover:text-foreground transition-colors">Smart Thermostats</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/support" className="block hover:text-foreground transition-colors">Installation</Link>
                <Link href="/support" className="block hover:text-foreground transition-colors">Warranty</Link>
                <Link href="/support" className="block hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground transition-colors">About Us</Link>
                <Link href="/about" className="block hover:text-foreground transition-colors">Careers</Link>
                <Link href="/about" className="block hover:text-foreground transition-colors">News</Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2026 Comet. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
