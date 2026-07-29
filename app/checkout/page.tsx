"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SiteHeader } from "@/components/site-header"
import { useCart, type CartItem } from "@/lib/cart-context"
import { useIncentives, type Address } from "@/lib/incentives/context"
import { IncentiveResults } from "@/components/incentives/incentive-results"
import { usd, type IncentiveView } from "@/lib/incentives/model"
import { cartToDevices } from "@/lib/incentives/cart"
import { Zap, CreditCard, Truck, Shield, ArrowLeft, Check, Gift, Leaf, Mail, ChevronDown } from "@/components/ui/lucide-icons"

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon?: React.ReactNode
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          {icon}
          {title}
        </h2>
        {desc && <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

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
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
        active ? "border-primary bg-emerald-50/70 ring-1 ring-primary/20" : "hover:bg-muted/40"
      }`}
    >
      <input type="radio" name="ship" checked={active} onChange={() => setValue(id)} className="accent-primary" />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <span className="tnum text-sm font-medium text-foreground">${price.toFixed(2)}</span>
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
      <span className="tnum whitespace-nowrap">{value}</span>
    </div>
  )
}

function sameAddress(a: Address | null, b: Address | null): boolean {
  if (!a || !b) return a === b
  return a.line1 === b.line1 && a.city === b.city && a.state === b.state && a.zip === b.zip
}

interface PlacedOrder {
  orderId: string
  name: string
  email: string
  items: CartItem[]
  view?: IncentiveView
  emailHtml?: string
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { address, applied, setAddress, results, lookup } = useIncentives()

  const [ship, setShip] = useState("standard")
  const [placed, setPlaced] = useState(false)
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  // Confirmation must open at the top (note: it renders a tall email preview and
  // the user clicks "Complete order" from the bottom of the checkout).
  useEffect(() => {
    if (placed) window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [placed])

  // Push shipping address into the shared context (debounced) so the lookup runs.
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
    }
    try {
      const res = await fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: snapshot.name,
          orderId: orderRef,
          oneTimeBack: installBack,
          utilityName: view?.utilityName ?? null,
          programName: view?.programs?.[0]?.name ?? null,
        }),
      })
      const data = await res.json()
      snapshot.emailHtml = data.html
    } catch {
      /* preview render is best-effort */
    }
    setOrder(snapshot)
    dispatch({ type: "CLEAR_CART" })
    setPlaced(true)
    setSubmitting(false)
  }

  // ── Order confirmed ──
  if (placed && order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto max-w-[600px] px-4 py-14">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-primary ring-8 ring-emerald-50/60">
              <Check className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Order confirmed</h1>
            <p className="mt-2 text-muted-foreground">
              Thanks{order.name ? `, ${order.name}` : ""} — order{" "}
              <span className="font-mono text-sm">#{order.orderId}</span> is on its way.
            </p>
          </div>

          {order.view?.eligible && (
            <div className="mt-8">
              <IncentiveResults view={order.view} />
            </div>
          )}

          {/* Real Leap email — collapsed preview */}
          {order.emailHtml && (
            <Collapsible className="group mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[state=open]:border-b">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground">View your confirmation email</span>
                    <span className="truncate text-xs text-muted-foreground">
                      See the email Leap sent on your behalf
                    </span>
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="bg-emerald-50/60 px-4 py-2.5 text-[12px] leading-snug text-emerald-800">
                  This is the real email <strong>Leap</strong> sends on Comet&apos;s behalf, shown as a
                  preview. This open-source reference site doesn&apos;t send email — Leap manages delivery
                  for the partner.
                  {order.email ? <span className="block text-emerald-700/80">Sent to {order.email}</span> : null}
                </div>
                <iframe
                  title="Confirmation email preview"
                  srcDoc={order.emailHtml}
                  // Static, JS-free email preview: fully sandboxed (no allow-scripts,
                  // no allow-same-origin) so injected markup can never run with this
                  // origin's privileges. Inline styles + remote <img> still render.
                  sandbox=""
                  tabIndex={-1}
                  loading="lazy"
                  className="h-[560px] w-full border-t bg-white"
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="mt-8 flex justify-center">
            <Button asChild>
              <Link href="/#products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty cart ──
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto max-w-md py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
            <Zap className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-1 text-muted-foreground">Add a charger before checking out.</p>
          <Button className="mt-5" asChild>
            <Link href="/#products">Browse chargers</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container max-w-[1160px] py-8 pb-20">
        <Link
          href="/#products"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to chargers
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
        <p className="mt-1 text-muted-foreground">Complete your order for premium EV charging.</p>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">
            <Section
              icon={<Truck className="h-5 w-5 text-primary" />}
              title="Shipping information"
              desc="Where should we deliver your order?"
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>First name</Label>
                    <Input placeholder="Jordan" value={firstName} maxLength={100} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last name</Label>
                    <Input placeholder="Rivera" value={lastName} maxLength={100} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="123 Market St" value={line1} onChange={(e) => setLine1(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:contents">
                    <div className="space-y-1.5">
                      <Label>State</Label>
                      <Input
                        placeholder="CA"
                        value={stateVal}
                        maxLength={2}
                        onChange={(e) =>
                          setStateVal(e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
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
                </div>
              </div>
            </Section>

            <Section title="Shipping method" desc="Choose your delivery speed.">
              <div className="flex flex-col gap-3">
                <ShipOption id="standard" label="Standard shipping" sub="5–7 business days" price={9.99} value={ship} setValue={setShip} />
                <ShipOption id="express" label="Express shipping" sub="2–3 business days" price={29.99} value={ship} setValue={setShip} />
                <ShipOption id="overnight" label="Overnight shipping" sub="Next business day" price={49.99} value={ship} setValue={setShip} />
              </div>
            </Section>

            <Section
              icon={<Gift className="h-5 w-5 text-primary" />}
              title="Your incentives"
              desc="Programs available at your shipping address — checked live and filed for you after purchase."
            >
              {!applied ? (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                  Enter your shipping address above to see the incentives you qualify for.
                </div>
              ) : checkoutState?.status === "error" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Couldn&apos;t check incentives: {checkoutState.error}
                </div>
              ) : !view ? (
                <div className="animate-pulse rounded-xl border bg-card p-5 text-sm text-muted-foreground">
                  Checking incentives for {address?.city}, {address?.state}…
                </div>
              ) : (
                <IncentiveResults view={view} />
              )}
            </Section>

            <Section
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              title="Payment information"
              desc="Your payment details are secure and encrypted."
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Name on card</Label>
                  <Input placeholder="Jordan Rivera" />
                </div>
                <div className="space-y-1.5">
                  <Label>Card number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Expiry date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVV</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
                <p className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Demo checkout — no real payment is processed.
                </p>
              </div>
            </Section>
          </div>

          {/* ── Order summary ── */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
            <p className="text-sm text-muted-foreground">{state.itemCount} items</p>

            <div className="mt-4 flex flex-col gap-3">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-xl border object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="tnum whitespace-nowrap text-sm font-medium text-foreground">
                    {usd(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Shipping" value={`$${shipCost.toFixed(2)}`} />
              <Row label="Tax" value={`$${tax.toFixed(2)}`} />
              {upfront > 0 && (
                <Row label="Instant incentive credit" value={`−$${upfront.toFixed(2)}`} color="text-emerald-700" />
              )}
              <div className="mt-1 flex items-baseline justify-between border-t pt-3 text-base font-semibold text-foreground">
                <span>Due today</span>
                <span className="tnum">${dueToday.toFixed(2)}</span>
              </div>

              {view?.eligible && (installBack > 0 || ongoing > 0) && (
                <div className="mt-2 flex flex-col gap-2 rounded-xl bg-emerald-50 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">
                    After purchase
                  </p>
                  {installBack > 0 && (
                    <>
                      <Row label="Incentives back" value={`+${usd(installBack)}`} color="text-emerald-700" />
                      <Row label="Effective cost" value={`≈ $${effectiveCost.toFixed(2)}`} color="text-emerald-700" bold />
                    </>
                  )}
                  {ongoing > 0 && (
                    <div className="flex justify-between gap-3 text-sm text-violet-700">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Leaf className="h-3.5 w-3.5" /> VPP earnings
                      </span>
                      <span className="tnum whitespace-nowrap font-semibold">+{usd(ongoing)}/yr</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={placeOrder} disabled={submitting}>
              {submitting ? "Placing order…" : `Complete order — $${dueToday.toFixed(2)}`}
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              By placing your order, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
