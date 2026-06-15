"use client"

import { Leaf } from "@/components/ui/lucide-icons"

export function IncentiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-violet-600 text-white whitespace-nowrap">
      <Leaf className="h-3 w-3" />
      Incentives
    </span>
  )
}
