"use client"

import { useState } from "react"
import { MapPin, Check } from "@/components/ui/lucide-icons"

interface LocationBannerProps {
  zip: string
  applied: boolean
  onApply: (z: string) => void
}

export function LocationBanner({ zip, applied, onApply }: LocationBannerProps) {
  const [val, setVal] = useState(zip || "")
  const ok = val.length === 5

  if (applied) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
        <Check className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground flex-1">
          Incentives applied for {zip}
        </span>
        <button
          onClick={() => onApply("")}
          className="ml-auto text-sm font-medium text-primary hover:underline"
        >
          Change ZIP
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
      {/* Icon + copy */}
      <div className="flex items-start sm:items-center gap-4 flex-1">
        <span className="w-11 h-11 rounded-full bg-primary text-white inline-flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">See EV charging incentives near you</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
            Programs vary by product &amp; location — rebates, instant credits, and Virtual Power
            Plant earnings. Enter your ZIP to see what each charger qualifies for.
          </p>
        </div>
      </div>

      {/* ZIP input */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={val}
            inputMode="numeric"
            placeholder="ZIP code"
            maxLength={5}
            onChange={(e) => setVal(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && ok) onApply(val)
            }}
            className="w-36 h-11 pl-9 pr-3 rounded-lg border border-input bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          onClick={() => ok && onApply(val)}
          disabled={!ok}
          className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-90 transition-all"
        >
          See incentives
        </button>
      </div>
    </div>
  )
}
