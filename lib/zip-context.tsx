"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import type { EligibilityResult } from "./incentives-api"

export interface Address {
  line1: string
  city: string
  state: string
  zip: string
  display: string
}

interface ZipContextType {
  /** Full address when set via Places autocomplete; null when set from a bare ZIP. */
  address: Address | null
  /** Derived from address.zip when available, else the raw ZIP string. */
  zip: string
  applied: boolean
  /** Set incentive location from a bare ZIP (checkout form, inline inputs). */
  onApply: (z: string) => void
  /** Set incentive location from a Google Places result (LocationBanner). */
  onApplyAddress: (a: Address) => void
  /** Clear the applied location and reset the cache. */
  onClear: () => void
  incentivesCache: Record<number, EligibilityResult | null>
  isFetching: Record<number, boolean>
  fetchIncentives: (productId: number) => Promise<void>
}

const ZipContext = createContext<ZipContextType | null>(null)

export function ZipProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null)
  const [zip, setZip] = useState("")
  const [applied, setApplied] = useState(false)
  const [incentivesCache, setIncentivesCache] = useState<Record<number, EligibilityResult | null>>({})
  const [isFetching, setIsFetching] = useState<Record<number, boolean>>({})
  const cachedZipRef = useRef("")

  const clearCache = (newZip: string) => {
    if (newZip !== cachedZipRef.current) {
      cachedZipRef.current = newZip
      setIncentivesCache({})
      setIsFetching({})
    }
  }

  const onApply = (z: string) => {
    const v = z.replace(/\D/g, "").slice(0, 5)
    setZip(v)
    setAddress(null)
    const newApplied = v.length === 5
    setApplied(newApplied)
    clearCache(v)
  }

  const onApplyAddress = (a: Address) => {
    setAddress(a)
    setZip(a.zip)
    setApplied(true)
    clearCache(a.zip)
  }

  const onClear = () => {
    setAddress(null)
    setZip("")
    setApplied(false)
    clearCache("")
  }

  const fetchIncentives = useCallback(
    async (productId: number) => {
      if (!zip || zip.length !== 5) return
      if (incentivesCache[productId] !== undefined) return
      if (isFetching[productId]) return

      setIsFetching((prev) => ({ ...prev, [productId]: true }))
      try {
        const res = await fetch("/api/incentives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zip, address, productId }),
        })
        if (res.ok) {
          const data: EligibilityResult = await res.json()
          setIncentivesCache((prev) => ({ ...prev, [productId]: data }))
        } else {
          setIncentivesCache((prev) => ({ ...prev, [productId]: null }))
        }
      } catch {
        setIncentivesCache((prev) => ({ ...prev, [productId]: null }))
      } finally {
        setIsFetching((prev) => ({ ...prev, [productId]: false }))
      }
    },
    [zip, address, incentivesCache, isFetching]
  )

  return (
    <ZipContext.Provider
      value={{ address, zip, applied, onApply, onApplyAddress, onClear, incentivesCache, isFetching, fetchIncentives }}
    >
      {children}
    </ZipContext.Provider>
  )
}

export function useZip() {
  const ctx = useContext(ZipContext)
  if (!ctx) throw new Error("useZip must be used within a ZipProvider")
  return ctx
}
