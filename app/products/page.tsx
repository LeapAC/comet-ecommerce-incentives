"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import { LocationBanner } from "@/components/incentives/location-banner"
import { PriceBreakdown } from "@/components/incentives/price-breakdown"
import { IncentiveBadge } from "@/components/incentives/incentive-badge"
import { useCart } from "@/lib/cart-context"
import { useZip } from "@/lib/zip-context"
import { PRODUCTS } from "@/lib/products"
import { computeIncentives, usd } from "@/lib/incentives"
import { Zap, Wifi, Search, Filter, ShoppingCart, Star } from "@/components/ui/lucide-icons"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const CATEGORIES = ["All", "EV Charger", "Smart Thermostat"]

function CategoryPill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-4 rounded-full text-sm font-medium border transition-all ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-foreground border-border hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  )
}

function ProductCard({
  product,
  applied,
}: {
  product: (typeof PRODUCTS)[0]
  applied: boolean
}) {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [hover, setHover] = useState(false)
  const c = computeIncentives(product.id, product.price)

  const addToCart = () => {
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
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` })
  }

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden flex flex-col transition-shadow duration-300 ${
        hover ? "shadow-lg" : "shadow-sm"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-44 object-cover transition-transform duration-300 ${
            hover ? "scale-105" : "scale-100"
          }`}
        />
        <span className="absolute top-3 left-3">
          <Badge variant="secondary">{product.badge}</Badge>
        </span>
        {applied && c.hasAny && (
          <span className="absolute top-3 right-3">
            <IncentiveBadge />
          </span>
        )}
        {/* Rating pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link
            href={`/products/${product.id}`}
            className="font-semibold text-[17px] text-foreground hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            {product.power ? (
              <Zap className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Wifi className="h-3.5 w-3.5 shrink-0" />
            )}
            {product.power ?? product.compatibility}
          </div>
        </div>

        {/* Price section */}
        <div className="mt-auto flex flex-col gap-3">
          {applied ? (
            <PriceBreakdown productId={product.id} price={product.price} />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{usd(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {usd(product.originalPrice)}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/products/${product.id}`}>Details</Link>
            </Button>
            <Button size="sm" className="flex-1" onClick={addToCart}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { address, zip, applied, onApplyAddress, onClear } = useZip()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const { state } = useCart()

  const filtered = PRODUCTS.filter((p) => {
    const mq = (p.name + " " + p.description).toLowerCase().includes(query.toLowerCase())
    const mc = category === "All" || p.category === category
    return mq && mc
  })

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

      {/* Page header + location banner */}
      <section className="pt-6 pb-0">
        <div className="container max-w-[1280px]">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
            <h1 className="text-[28px] font-bold text-foreground tracking-tight">
              Smart Home Devices
            </h1>
            <span className="text-sm text-muted-foreground">{filtered.length} products</span>
          </div>
          <LocationBanner address={address} applied={applied} onApplyAddress={onApplyAddress} onClear={onClear} />
        </div>
      </section>

      {/* Search + filter bar */}
      <section className="py-4 border-b">
        <div className="container max-w-[1280px] flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {cat === "EV Charger" ? "EV Chargers" : cat === "Smart Thermostat" ? "Smart Thermostats" : cat}
              </CategoryPill>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-7 pb-16">
        <div className="container max-w-[1280px]">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-foreground">No products found</p>
              <p className="text-sm mt-1">Try a different search or filter.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setQuery(""); setCategory("All") }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} applied={applied} />
              ))}
            </div>
          )}
        </div>
      </section>

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
                Your one-stop shop for smart home energy devices — EV chargers, thermostats, and real-time incentive estimates.
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
