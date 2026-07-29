"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Zap, CreditCard, Truck, Shield, ArrowLeft, Check, Gift, Leaf } from "@/components/ui/lucide-icons"
import { useCart, type CartItem } from "@/lib/cart-context"
import { useIncentives, type Address } from "@/lib/incentives/context"
import { IncentiveResults } from "@/components/incentives/incentive-results"
import { usd, type IncentiveView } from "@/lib/incentives/model"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"

// ─── Shipping option ──────────────────────────────────────────────────────────
function ShipOption({
  id,
  label,
  sub,
  price,
  value,
  setValue,
}: {
  id: string
  label: string
  sub: string
  price: number
  value: string
  setValue: (v: string) => void
}) {
  const active = value === id
  return (
    <label
      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
        active ? "border-primary bg-emerald-50" : "border-border hover:bg-muted/30"
      }`}
    >
      <input type="radio" name="ship" checked={active} onChange={() => setValue(id)} className="accent-primary" />
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

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string
  value: string
  color?: string
  bold?: boolean
}) {
  return (
    <div className={`flex justify-between gap-3 text-sm ${bold ? "font-semibold" : ""} ${color ?? "text-foreground/80"}`}>
      <span className="whitespace-nowrap">{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  )
}

function sameAddress(a: Address | null, b: Address | null): boolean {
  if (!a || !b) return a === b
  return a.line1 === b.line1 && a.city === b.city && a.state === b.state && a.zip === b.zip
}

/** Maps the cart into one Leap device entry per unit, with unique references. */
function cartToDevices(items: CartItem[]): { deviceId: string; ref: string }[] {
  return items.flatMap((it) => {
    const prod = PRODUCTS.find((p) => p.id === it.id)
    if (!prod) return []
    return Array.from({ length: it.quantity }, (_, n) => ({
      deviceId: prod.deviceId,
      ref: `p${it.id}-${n + 1}`,
    }))
  })
}

interface PlacedOrder {
  orderId: string
  name: string
  email: string
  items: CartItem[]
  view?: IncentiveView
  emailSent: boolean
  emailReason?: string
  emailHtml?: string
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { address, applied, setAddress, results, lookup } = useIncentives()

  const [ship, setShip] = useState("standard")
  const [placed, setPlaced] = useState(false)
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Shipping form (local state; pushed to the incentives context when complete)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [line1, setLine1] = useState(address?.line1 ?? "")
  const [city, setCity] = useState(address?.city ?? "")
  const [stateVal, setStateVal] = useState(address?.state ?? "")
  const [zip, setZip] = useState(address?.zip ?? "")

  const orderRef = useRef(
    `comet-order-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  ).current

  // Push the shipping address into the shared context (debounced) so the
  // incentive lookup uses the real checkout address.
  useEffect(() => {
    const complete = line1 && city && stateVal.length === 2 && zip.length === 5
    if (!complete) return
    const next: Address = { line1: line1.trim(), city: city.trim(), state: stateVal.toUpperCase(), zip }
    if (sameAddress(next, address)) return
    const t = setTimeout(() => setAddress(next), 500)
    return () => clearTimeout(t)
  }, [line1, city, stateVal, zip, address, setAddress])

  const cartDevices = useMemo(() => cartToDevices(state.items), [state.items])
  const deviceSig = cartDevices.map((d) => `${d.deviceId}:${d.ref}`).join("|")

  // Run one lookup for the whole cart when address + devices are ready.
  const lastRun = useRef("")
  useEffect(() => {
    if (!applied || cartDevices.length === 0) return
    const addrSig = address ? `${address.line1}|${address.city}|${address.state}|${address.zip}` : ""
    const sig = `${addrSig}::${deviceSig}`
    if (lastRun.current === sig) return
    lastRun.current = sig
    lookup("checkout", cartDevices, { referenceId: orderRef })
  }, [applied, address, deviceSig, cartDevices, lookup, orderRef])

  const checkoutState = results["checkout"]
  const view = checkoutState?.status === "done" ? checkoutState.view : undefined

  const shipCost = ship === "express" ? 29.99 : ship === "overnight" ? 49.99 : 9.99
  const subtotal = state.total
  const tax = subtotal * 0.08
  // UPFRONT incentives are a point-of-sale discount — they reduce due-today.
  // (Reserved in the current API: upfront_amount is always 0, so live totals
  // are unchanged; INSTALL/ongoing money is returned after purchase instead.)
  const upfront = view?.eligible ? view.upfrontAmount : 0
  const dueToday = Math.max(0, subtotal + shipCost + tax - upfront)
  const installBack = view?.eligible ? view.oneTimeBack : 0
  const ongoing = view?.eligible ? view.ongoingAmount : 0
  const effectiveCost = Math.max(0, dueToday - installBack)

  const placeOrder = async () => {
    setSubmitting(true)
    const items = [...state.items]
    const snapshot: PlacedOrder = {
      orderId: orderRef,
      name: `${firstName} ${lastName}`.trim(),
      email,
      items,
      view,
      emailSent: false,
    }
    try {
      const res = await fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customerName: snapshot.name,
          orderId: orderRef,
          items: items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price })),
          oneTimeBack: installBack,
          ongoingAmount: ongoing,
          utilityName: view?.utilityName ?? null,
          connectUrl: view?.connectUrl ?? null,
        }),
      })
      const data = await res.json()
      snapshot.emailSent = !!data.sent
      snapshot.emailReason = data.reason
      snapshot.emailHtml = data.html
    } catch (err) {
      snapshot.emailReason = err instanceof Error ? err.message : "Failed to send email"
    }
    setOrder(snapshot)
    dispatch({ type: "CLEAR_CART" })
    setPlaced(true)
    setSubmitting(false)
  }

  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between max-w-[1280px]">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">Comet</span>
        </Link>
        {!placed && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Link>
          </Button>
        )}
      </div>
    </header>
  )

  // ── Order confirmed ──
  if (placed && order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-[560px] mx-auto py-16 px-4 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
            <Check className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Order confirmed</h1>
            <p className="text-muted-foreground mt-1">
              Thanks{order.name ? `, ${order.name}` : ""} — order{" "}
              <span className="font-mono text-sm">#{order.orderId}</span> is on its way.
            </p>
          </div>

          {/* Post-purchase incentives */}
          {order.view?.eligible && (
            <div className="w-full">
              <IncentiveResults view={order.view} />
            </div>
          )}

          {/* Email demo */}
          <div className="w-full rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Confirmation email</span>
              <span className="text-xs text-muted-foreground">
                {order.emailSent
                  ? `Sent to ${order.email}`
                  : `Preview${order.email ? ` for ${order.email}` : ""} · not delivered`}
              </span>
            </div>
            {!order.emailSent && (
              <div className="px-4 py-2 bg-amber-50 border-b text-[12px] text-amber-800">
                Demo mode — {order.emailReason ?? "email delivery is disabled"}. Set{" "}
                <code className="font-mono">RESEND_API_KEY</code> to send for real.
              </div>
            )}
            {order.emailHtml && (
              <iframe
                title="Confirmation email preview"
                srcDoc={order.emailHtml}
                className="w-full h-[520px] bg-white"
              />
            )}
          </div>

          <Button asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Empty cart ──
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some products to your cart before checking out.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
                  <Truck className="h-5 w-5" /> Shipping information
                </CardTitle>
                <CardDescription>Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input placeholder="Jordan" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input placeholder="Rivera" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="123 Market St" value={line1} onChange={(e) => setLine1(e.target.value)} />
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      placeholder="CA"
                      value={stateVal}
                      maxLength={2}
                      onChange={(e) => setStateVal(e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP code</Label>
                    <Input
                      placeholder="94103"
                      value={zip}
                      inputMode="numeric"
                      maxLength={5}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping method */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping method</CardTitle>
                <CardDescription>Choose your preferred delivery speed.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ShipOption id="standard" label="Standard shipping" sub="5–7 business days" price={9.99} value={ship} setValue={setShip} />
                <ShipOption id="express" label="Express shipping" sub="2–3 business days" price={29.99} value={ship} setValue={setShip} />
                <ShipOption id="overnight" label="Overnight shipping" sub="Next business day" price={49.99} value={ship} setValue={setShip} />
              </CardContent>
            </Card>

            {/* Incentives (driven by the shipping address) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Your incentives
                </CardTitle>
                <CardDescription>
                  Programs available at your shipping address — checked live via the Leap Incentives API and
                  filed for you after purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!applied ? (
                  <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground text-center">
                    Enter your shipping address above to see the incentives you qualify for.
                  </div>
                ) : checkoutState?.status === "error" ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Couldn&apos;t check incentives: {checkoutState.error}
                  </div>
                ) : !view ? (
                  <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground animate-pulse">
                    Checking incentives for {address?.city}, {address?.state}…
                  </div>
                ) : (
                  <IncentiveResults view={view} />
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment information
                </CardTitle>
                <CardDescription>Your payment details are secure and encrypted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name on card</Label>
                  <Input placeholder="Jordan Rivera" />
                </div>
                <div className="space-y-2">
                  <Label>Card number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Demo checkout — no real payment is processed.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Order summary sidebar ── */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>{state.itemCount} items in your cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
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

              <div className="flex flex-col gap-2">
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={`$${shipCost.toFixed(2)}`} />
                <Row label="Tax" value={`$${tax.toFixed(2)}`} />
                {upfront > 0 && (
                  <Row
                    label="Instant incentive credit"
                    value={`−$${upfront.toFixed(2)}`}
                    color="text-emerald-700"
                  />
                )}
                <div className="border-t pt-3 flex justify-between font-semibold text-foreground">
                  <span>Due today</span>
                  <span>${dueToday.toFixed(2)}</span>
                </div>

                {view?.eligible && (installBack > 0 || ongoing > 0) && (
                  <div className="mt-1 p-3 rounded-xl bg-emerald-50 flex flex-col gap-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      After purchase
                    </p>
                    {installBack > 0 && (
                      <>
                        <Row label="Incentives back" value={`+${usd(installBack)}`} color="text-emerald-700" />
                        <Row label="Effective cost" value={`≈ $${effectiveCost.toFixed(2)}`} color="text-emerald-700" bold />
                      </>
                    )}
                    {ongoing > 0 && (
                      <div className="flex justify-between gap-3 text-sm text-violet-600">
                        <span className="whitespace-nowrap flex items-center gap-1.5">
                          <Leaf className="h-3.5 w-3.5" /> VPP earnings
                        </span>
                        <span className="whitespace-nowrap font-medium">+{usd(ongoing)}/yr</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button size="lg" className="w-full" onClick={placeOrder} disabled={submitting}>
                {submitting ? "Placing order…" : `Complete order — $${dueToday.toFixed(2)}`}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By placing your order, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
