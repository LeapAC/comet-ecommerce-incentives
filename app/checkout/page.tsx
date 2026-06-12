"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Zap, CreditCard, Truck, Shield, ArrowLeft, Check, MapPin, Gift } from "@/components/ui/lucide-icons"
import { useCart } from "@/lib/cart-context"
import { useZip } from "@/lib/zip-context"
import { computeIncentives, PROGRAM_META, usd } from "@/lib/incentives"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ─── Shipping option ──────────────────────────────────────────────────────────
function ShipOption({
  id, label, sub, price, value, setValue,
}: {
  id: string; label: string; sub: string; price: number
  value: string; setValue: (v: string) => void
}) {
  const active = value === id
  return (
    <label
      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
        active ? "border-primary bg-emerald-50" : "border-border hover:bg-muted/30"
      }`}
    >
      <input
        type="radio"
        name="ship"
        checked={active}
        onChange={() => setValue(id)}
        className="accent-primary"
      />
      <div className="flex-1 flex justify-between items-center">
        <div>
          <div className="font-medium text-sm text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <span className="font-medium text-sm text-foreground">${price.toFixed(2)}</span>
      </div>
    </label>
  )
}

// ─── Per-item incentives panel ────────────────────────────────────────────────
function IncentivesPanel({
  zip, applied, onApply,
}: { zip: string; applied: boolean; onApply: (z: string) => void }) {
  const { state } = useCart()
  const [val, setVal] = useState(zip || "")

  // Calculate potential cart savings for the teaser
  const pot = state.items.reduce(
    (a, item) => {
      const c = computeIncentives(item.id, item.price)
      a.oneTime += c.oneTimeBack * item.quantity
      a.vpp += c.vpp * item.quantity
      return a
    },
    { oneTime: 0, vpp: 0 }
  )
  const anyPot = pot.oneTime > 0 || pot.vpp > 0

  if (!applied) {
    return (
      <div className="rounded-xl overflow-hidden border border-emerald-200">
        {/* Callout header */}
        <div
          className="flex items-center gap-4 px-5 py-4"
          style={{ background: "linear-gradient(100deg, #ecfdf5, color-mix(in srgb, #7c3aed 8%, white))" }}
        >
          <span className="w-11 h-11 rounded-full bg-primary text-white inline-flex items-center justify-center shrink-0">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {anyPot
                ? `Don't leave ${usd(pot.oneTime)} on the table`
                : "Check for incentives before you buy"}
            </p>
            <p className="text-sm text-foreground/70 mt-0.5">
              {anyPot ? (
                <>
                  Your cart may qualify for up to{" "}
                  <strong className="text-emerald-700">{usd(pot.oneTime)}</strong> back
                  {pot.vpp > 0 && (
                    <> plus <strong className="text-violet-600">{usd(pot.vpp)}/yr</strong> in VPP earnings</>
                  )}
                  . Add your ZIP to apply them to this order.
                </>
              ) : (
                "Enter your ZIP — some areas have rebates and credits we can apply right now."
              )}
            </p>
          </div>
        </div>
        {/* ZIP input row */}
        <div className="flex gap-2 items-center p-4 bg-white">
          <div className="relative flex items-center flex-1">
            <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={val}
              inputMode="numeric"
              placeholder="Enter ZIP code"
              maxLength={5}
              onChange={(e) => setVal(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => { if (e.key === "Enter" && val.length === 5) onApply(val) }}
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={() => val.length === 5 && onApply(val)}
            disabled={val.length !== 5}
            className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-90 transition-all"
          >
            Apply savings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Incentives for {zip}</span>
        <button
          onClick={() => onApply("")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Change
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {state.items.map((item) => {
          const c = computeIncentives(item.id, item.price)
          return (
            <div key={item.id} className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-foreground">
                {item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </div>
              {!c.hasAny ? (
                <span className="text-xs text-muted-foreground">No incentives available for this item.</span>
              ) : (
                c.programs.map((pg, k) => {
                  const meta = PROGRAM_META[pg.type]
                  const amount =
                    pg.type === "vpp"
                      ? usd(pg.amount * item.quantity) + "/yr"
                      : (pg.type === "instant" ? "−" : "+") + usd(pg.amount * item.quantity)
                  return (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <span className={`flex items-center gap-1.5 text-foreground/80`}>
                        <span className={`text-xs ${meta.colorClass}`}>●</span>
                        {pg.name}
                        <span className="text-xs text-muted-foreground">· {meta.when}</span>
                      </span>
                      <span className={`font-medium whitespace-nowrap ${meta.colorClass}`}>{amount}</span>
                    </div>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 bg-muted/20 border-t text-center text-[10px] text-muted-foreground">
        Powered by <strong className="text-foreground">Leap</strong> · Federal · State · Utility · VPP
      </div>
    </div>
  )
}

// ─── Summary row ──────────────────────────────────────────────────────────────
function Row({
  label, value, color, bold,
}: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 text-sm ${bold ? "font-semibold" : ""} ${color ?? "text-foreground/80"}`}>
      <span className="whitespace-nowrap">{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { zip, applied, onApply } = useZip()
  const router = useRouter()
  const [ship, setShip] = useState("standard")
  const [placed, setPlaced] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateVal, setStateVal] = useState("")

  const shipCost = ship === "express" ? 29.99 : ship === "overnight" ? 49.99 : 9.99

  // Aggregate incentives from cart
  const agg = state.items.reduce(
    (a, item) => {
      const c = computeIncentives(item.id, item.price)
      a.instant += c.instant * item.quantity
      a.rebate += c.rebate * item.quantity
      a.vpp += c.vpp * item.quantity
      return a
    },
    { instant: 0, rebate: 0, vpp: 0 }
  )
  const instant = applied ? agg.instant : 0
  const rebate = applied ? agg.rebate : 0
  const vpp = applied ? agg.vpp : 0

  const subtotal = state.total
  const tax = subtotal * 0.08
  const dueToday = Math.max(0, subtotal + shipCost + tax - instant)
  const netCost = Math.max(0, dueToday - rebate)

  // ── Empty cart ──
  if (state.items.length === 0 && !placed) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
          <div className="container flex h-16 items-center max-w-[1280px]">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold">Comet</span>
            </Link>
          </div>
        </header>
        <div className="container max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some products to your cart before checking out.</p>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div>
      </div>
    )
  }

  // ── Order confirmed ──
  if (placed) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
          <div className="container flex h-16 items-center max-w-[1280px]">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold">Comet</span>
            </Link>
          </div>
        </header>
        <div className="container max-w-[460px] mx-auto py-24 text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order is confirmed and will ship soon.
          </p>
          {applied && (rebate > 0 || vpp > 0) && (
            <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
              <p className="text-sm font-semibold text-foreground mb-2">What happens next</p>
              {rebate > 0 && (
                <p className="text-sm text-foreground/80">
                  • We'll file your <strong>{usd(rebate)}</strong> rebate after install — paid back to you once verified.
                </p>
              )}
              {vpp > 0 && (
                <p className="text-sm text-foreground/80 mt-1.5">
                  • Enroll in VPP to start earning <strong>{usd(vpp)}/yr</strong>.
                </p>
              )}
            </div>
          )}
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between max-w-[1280px]">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold">Comet</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Link>
          </Button>
        </div>
      </header>

      <div className="container max-w-[1280px] py-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your order for premium EV charging solutions.</p>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">
            {/* Shipping info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" /> Shipping Information
                </CardTitle>
                <CardDescription>Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="Jordan" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Rivera" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="123 Market St" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input placeholder="CA" value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input
                      placeholder="94103"
                      value={zip}
                      onChange={(e) => onApply(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping method */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
                <CardDescription>Choose your preferred delivery speed.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ShipOption id="standard" label="Standard Shipping" sub="5–7 business days" price={9.99} value={ship} setValue={setShip} />
                <ShipOption id="express" label="Express Shipping" sub="2–3 business days" price={29.99} value={ship} setValue={setShip} />
                <ShipOption id="overnight" label="Overnight Shipping" sub="Next business day" price={49.99} value={ship} setValue={setShip} />
              </CardContent>
            </Card>

            {/* Incentives panel */}
            <Card>
              <CardHeader>
                <CardTitle>Your incentives</CardTitle>
                <CardDescription>
                  Programs available for your items — applied automatically to your order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncentivesPanel zip={zip} applied={applied} onApply={onApply} />
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment Information
                </CardTitle>
                <CardDescription>Your payment details are secure and encrypted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name on Card</Label>
                  <Input placeholder="Jordan Rivera" />
                </div>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Your payment information is encrypted and secure.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Order summary sidebar ── */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{state.itemCount} items in your cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart items */}
              <div className="flex flex-col gap-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price rows */}
              <div className="flex flex-col gap-2">
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={`$${shipCost.toFixed(2)}`} />
                <Row label="Tax" value={`$${tax.toFixed(2)}`} />
                {instant > 0 && (
                  <Row label="Instant credit" value={`−$${instant.toFixed(2)}`} color="text-emerald-700" />
                )}
                <div className="border-t pt-3 flex justify-between font-semibold text-foreground">
                  <span>Due today</span>
                  <span>${dueToday.toFixed(2)}</span>
                </div>

                {/* After purchase block */}
                {(rebate > 0 || vpp > 0) && (
                  <div className="mt-1 p-3 rounded-xl bg-emerald-50 flex flex-col gap-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      After purchase
                    </p>
                    {rebate > 0 && (
                      <>
                        <Row label="Rebates after install" value={`+$${rebate.toFixed(2)}`} color="text-emerald-700" />
                        <Row label="Net cost" value={`≈ $${netCost.toFixed(2)}`} color="text-emerald-700" bold />
                      </>
                    )}
                    {vpp > 0 && (
                      <Row label="VPP earnings" value={`+$${vpp.toFixed(2)}/yr`} color="text-violet-600" />
                    )}
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  dispatch({ type: "CLEAR_CART" })
                  setPlaced(true)
                }}
              >
                Complete Order — ${dueToday.toFixed(2)}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By placing your order, you agree to our{" "}
                {applied && (
                  <>
                    <a href="#" className="text-primary hover:underline">Incentive Terms</a>,{" "}
                  </>
                )}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>, and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
