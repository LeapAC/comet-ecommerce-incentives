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

function fieldClass(extra = "") {
  return `h-11 px-3 rounded-lg border border-input bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${extra}`
}

/**
 * Address entry that drives the shared incentives lookup. The Leap API needs a
 * full street address (it geocodes to find serving utilities), so we collect
 * one here rather than ZIP alone — with a one-click example to make the demo
 * frictionless.
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
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
        <Check className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground flex-1 truncate">
          Incentives for {address?.line1}, {address?.city} {address?.state} {address?.zip}
        </span>
        <button
          onClick={() => {
            setForm(address ?? form)
            setEditing(true)
          }}
          className="text-sm font-medium text-primary hover:underline shrink-0"
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

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <span className="w-11 h-11 rounded-full bg-primary text-white inline-flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{heading}</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{blurb}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <input
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          placeholder="Street address"
          className={fieldClass("w-full")}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div className="grid grid-cols-[1fr_5rem_6rem] gap-2.5">
          <input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City"
            className={fieldClass()}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <input
            value={form.state}
            onChange={(e) =>
              setForm((f) => ({ ...f, state: e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 2) }))
            }
            placeholder="State"
            maxLength={2}
            className={fieldClass("uppercase")}
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
            className={fieldClass()}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <button
            onClick={submit}
            disabled={!ready}
            className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95 transition-all"
          >
            {cta}
          </button>
          <button
            type="button"
            onClick={() => setForm(EXAMPLE_ADDRESS)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Use example address
          </button>
        </div>
      </div>
    </div>
  )
}
