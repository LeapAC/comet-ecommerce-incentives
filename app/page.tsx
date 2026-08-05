"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PRODUCTS } from "@/lib/products"
import { usd } from "@/lib/incentives/model"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { Zap, ArrowRight, Star, MapPin, Gift, Leaf, ShoppingCart } from "@/components/ui/lucide-icons"

function ProductCard({ product }: { product: (typeof PRODUCTS)[number] }) {
  const { dispatch } = useCart()
  const { toast } = useToast()

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3">
          <Badge variant="secondary" className="shadow-sm">
            {product.badge}
          </Badge>
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="tnum">{product.rating}</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/products/${product.id}`}
          className="text-[17px] font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5 shrink-0" />
          {product.power} · {product.connector}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <span className="tnum text-2xl font-bold text-foreground">{usd(product.price)}</span>
            {product.originalPrice && (
              <span className="tnum ml-1.5 text-sm text-muted-foreground line-through">
                {usd(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <Gift className="h-3 w-3" />
            Incentives
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-card" asChild>
            <Link href={`/products/${product.id}`}>Details</Link>
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
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
              toast({ title: "Added to cart", description: `${product.name} added to your cart.` })
            }}
          >
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    Icon: ShoppingCart,
    title: "Pick your charger",
    body: "Browse our range of home and commercial EV chargers, from compact to DC-fast.",
  },
  {
    Icon: MapPin,
    title: "Enter your address",
    body: "We check live utility programs for your address and show exactly what you qualify for.",
  },
  {
    Icon: Gift,
    title: "We handle the rebates",
    body: "Comet files every rebate for you after purchase — no forms to chase, no waiting on hold.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        {/* Decorative hero wash, keyed to --primary so it follows the brand.
            Both ends are the brand blue at different strengths; the violet end
            it used to have sat within 22 ΔRGB of the Leap Incentives Gateway's
            own violet, which is the one colour this storefront should not
            borrow. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.04]" />
        <div className="container relative max-w-[1200px] py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-7">
              <Badge variant="secondary" className="w-fit">
                <Leaf className="mr-1 h-3 w-3" />
                Chargers with built-in incentives
              </Badge>
              <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
                Charge smarter.
                <br />
                <span className="text-primary">Get paid</span> to do it.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
                Premium EV chargers that come with the rebates, utility credits, and Virtual Power
                Plant earnings you qualify for — surfaced at checkout, filed for you after.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="px-8 text-base" asChild>
                  <Link href="/#products">
                    Shop chargers
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-card px-8 text-base" asChild>
                  <Link href="/#how-it-works">How it works</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" /> 4.9/5 · 2,000+ reviews
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-emerald-600" /> Rebates filed for you
                </span>
              </div>
            </div>

            <div className="relative">
              <img
                src="/modern-ev-charger-in-use-with-electric-car-chargin.jpg"
                alt="Comet EV charger in use"
                className="h-auto w-full rounded-3xl border shadow-xl"
              />
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border bg-card p-4 shadow-lg sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
                  Money back available
                </p>
                <p className="tnum mt-0.5 text-2xl font-bold text-foreground">
                  up to $647 <span className="text-base font-semibold text-muted-foreground">back</span>
                </p>
                <p className="text-xs text-muted-foreground">on a home charger in CA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b bg-muted/30 py-16">
        <div className="container max-w-[1100px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Incentives, without the paperwork</h2>
            <p className="mt-3 text-lg text-muted-foreground text-pretty">
              Every eligible rebate, utility program, and VPP offer — surfaced as you shop and handled
              for you after you buy.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={i} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                <span className="tnum absolute right-5 top-5 text-sm font-bold text-muted-foreground/40">
                  0{i + 1}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-20 py-16">
        <div className="container max-w-[1200px]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Our chargers</h2>
              <p className="mt-2 text-muted-foreground">
                Open any charger to see the incentives available at your address.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
