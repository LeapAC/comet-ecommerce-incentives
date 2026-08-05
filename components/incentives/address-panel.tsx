"use client"

import { useState } from "react"
import { MapPin, Check } from "@/components/ui/lucide-icons"
import { useIncentives, type Address } from "@/lib/incentives/context"

/** A representative, real address so reviewers/demos see live results in one click. */
const EXAMPLE_ADDRESS: Address = {
  line1: "123 Market St",
  city: "San Francisco",
  state: "CA",
  zip: "94103",
}

const FIELD =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"

/**
 * Address entry that drives the shared incentives lookup. The Leap API needs a
 * full street address (it geocodes to find serving utilities), so we collect
 * one here rather than ZIP alone — with a one-click example to make the demo
 * frictionless. Fully responsive: fields stack cleanly on mobile.
 */
export function AddressPanel({
  heading = "See your EV charging incentives",
  blurb = "Programs vary by address — rebates, utility credits, and Virtual Power Plant earnings. Enter your address to see what you qualify for.",
  cta = "Check incentives",
}: {
  heading?: string
  blurb?: string
  cta?: string
}) {
  const { address, applied, setAddress } = useIncentives()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Address>(address ?? { line1: "", city: "", state: "", zip: "" })

  const ready = !!(form.line1 && form.city && form.state && form.zip.length >= 5)

  if (applied && !editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
          Incentives for {address?.line1}, {address?.city} {address?.state} {address?.zip}
        </span>
        <button
          onClick={() => {
            setForm(address ?? form)
            setEditing(true)
          }}
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          Change
        </button>
      </div>
    )
  }

  const submit = () => {
    if (!ready) return
    setAddress({
      line1: form.line1.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase().slice(0, 2),
      zip: form.zip.trim().slice(0, 5),
    })
    setEditing(false)
  }

  // Panel chrome tracks --primary. The emerald tint it replaced was picked when
  // the brand itself was emerald; against a blue primary and a blue icon tile it
  // read as a leftover. The confirmed-address chip above stays green, because
  // green there means "success", not "brand".
  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-card p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{heading}</p>
          <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{blurb}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <input
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          placeholder="Street address"
          className={FIELD}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {/* Grid tracks (not flex widths) define each field, so widths never
            collide with the shared w-full class. Mobile: city full, then
            [state | zip]. Desktop: city | state | zip on one row. */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_5rem_7rem]">
          <input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City"
            className={FIELD}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <div className="grid grid-cols-[5rem_1fr] gap-2.5 sm:contents">
            <input
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 2) }))
              }
              placeholder="State"
              maxLength={2}
              className={`${FIELD} uppercase`}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <input
              value={form.zip}
              inputMode="numeric"
              onChange={(e) =>
                setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, "").slice(0, 5) }))
              }
              placeholder="ZIP"
              maxLength={5}
              className={FIELD}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={submit}
            disabled={!ready}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cta}
          </button>
          <button
            type="button"
            onClick={() => setForm(EXAMPLE_ADDRESS)}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Use example address
          </button>
        </div>
      </div>
    </div>
  )
}
