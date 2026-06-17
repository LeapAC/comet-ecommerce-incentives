"use client"

import { Check, MapPin } from "@/components/ui/lucide-icons"
import { AddressSearch } from "./address-search"
import type { Address } from "@/lib/zip-context"

interface LocationBannerProps {
  address: Address | null
  applied: boolean
  onApplyAddress: (a: Address) => void
  onClear: () => void
}

export function LocationBanner({ address, applied, onApplyAddress, onClear }: LocationBannerProps) {
  if (applied && address) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
        <Check className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground flex-1 truncate">
          Incentives applied for {address.city}, {address.state}
        </span>
        <button
          onClick={onClear}
          className="ml-auto text-sm font-medium text-primary hover:underline shrink-0"
        >
          Change address
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
          <p className="font-semibold text-foreground">See smart home incentives near you</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
            Programs vary by product &amp; location — rebates, instant credits, and Virtual Power
            Plant earnings. Enter your address to see what each device qualifies for.
          </p>
        </div>
      </div>

      {/* Address search */}
      <div className="flex gap-2 shrink-0 sm:w-72">
        <AddressSearch
          onSelect={onApplyAddress}
          placeholder="Enter your address"
          className="flex-1"
        />
      </div>
    </div>
  )
}
