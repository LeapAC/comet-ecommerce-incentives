"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import type { EligibilityResult } from "./incentives-api"

interface ZipContextType {
  zip: string
  applied: boolean
  onApply: (z: string) => void
  // null = API returned an error/not configured (use hardcoded fallback)
  // EligibilityResult = real data from the Leap API
  incentivesCache: Record<number, EligibilityResult | null>
  isFetching: Record<number, boolean>
  fetchIncentives: (productId: number) => Promise<void>
}

const ZipContext = createContext<ZipContextType | null>(null)

export function ZipProvider({ children }: { children: React.ReactNode }) {
  const [zip, setZip] = useState("")
  const [applied, setApplied] = useState(false)
  const [incentivesCache, setIncentivesCache] = useState<Record<number, EligibilityResult | null>>({})
  const [isFetching, setIsFetching] = useState<Record<number, boolean>>({})
  // Track the ZIP that was used to populate the current cache so we can
  // invalidate it when the user changes their ZIP.
  const cachedZipRef = useRef("")

  const onApply = (z: string) => {
    const v = z.replace(/\D/g, "").slice(0, 5)
    setZip(v)
    const newApplied = v.length === 5
    setApplied(newApplied)
    // Clear cache whenever ZIP changes
    if (v !== cachedZipRef.current) {
      cachedZipRef.current = v
      setIncentivesCache({})
      setIsFetching({})
    }
  }

  const fetchIncentives = useCallback(
    async (productId: number) => {
      if (!zip || zip.length !== 5) return
      // Already cached (even if null — means we already tried and failed)
      if (incentivesCache[productId] !== undefined) return
      // Already in flight
      if (isFetching[productId]) return

      setIsFetching((prev) => ({ ...prev, [productId]: true }))
      try {
        const res = await fetch("/api/incentives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zip, productId }),
        })
        if (res.ok) {
          const data: EligibilityResult = await res.json()
          setIncentivesCache((prev) => ({ ...prev, [productId]: data }))
        } else {
          // Not configured, no device ID, or API error — fall back to hardcoded
          setIncentivesCache((prev) => ({ ...prev, [productId]: null }))
        }
      } catch {
        setIncentivesCache((prev) => ({ ...prev, [productId]: null }))
      } finally {
        setIsFetching((prev) => ({ ...prev, [productId]: false }))
      }
    },
    [zip, incentivesCache, isFetching]
  )

  return (
    <ZipContext.Provider value={{ zip, applied, onApply, incentivesCache, isFetching, fetchIncentives }}>
      {children}
    </ZipContext.Provider>
  )
}

export function useZip() {
  const ctx = useContext(ZipContext)
  if (!ctx) throw new Error("useZip must be used within a ZipProvider")
  return ctx
}
