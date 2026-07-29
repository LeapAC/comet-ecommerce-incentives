"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import type { CustomerClassification } from "@/lib/leap/types"
import type { IncentiveView } from "@/lib/incentives/model"

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export type LookupStatus = "idle" | "loading" | "done" | "error"

export interface LookupState {
  status: LookupStatus
  view?: IncentiveView
  error?: string
}

export interface DeviceRef {
  deviceId: string
  ref?: string
}

interface LookupOptions {
  referenceId?: string
  classification?: CustomerClassification
  customerDetails?: Record<string, string>
}

interface IncentivesContextValue {
  address: Address | null
  /** True once we have the minimum fields for a lookup. */
  applied: boolean
  setAddress: (a: Address | null) => void
  results: Record<string, LookupState>
  /** Run (or re-run) a lookup and cache it under `key`. */
  lookup: (key: string, devices: DeviceRef[], opts?: LookupOptions) => Promise<void>
  reset: () => void
}

const IncentivesContext = createContext<IncentivesContextValue | null>(null)

const STORAGE_KEY = "comet-address"

function isComplete(a: Address | null): a is Address {
  return !!(a && a.line1 && a.city && a.state && a.zip.length >= 5)
}

export function IncentivesProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddressState] = useState<Address | null>(null)
  const [results, setResults] = useState<Record<string, LookupState>>({})
  // Guards against out-of-order responses when the address changes mid-flight.
  const addressToken = useRef(0)

  // Rehydrate the address so a customer's PDP entry carries into checkout.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setAddressState(JSON.parse(saved))
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  const setAddress = useCallback((a: Address | null) => {
    addressToken.current += 1
    setAddressState(a)
    setResults({}) // any cached result is stale once the address changes
    try {
      if (a) localStorage.setItem(STORAGE_KEY, JSON.stringify(a))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const reset = useCallback(() => setAddress(null), [setAddress])

  const lookup = useCallback(
    async (key: string, devices: DeviceRef[], opts?: LookupOptions) => {
      if (!isComplete(address) || devices.length === 0) return
      const token = addressToken.current
      setResults((r) => ({ ...r, [key]: { status: "loading" } }))
      try {
        const res = await fetch("/api/incentives/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            devices,
            referenceId: opts?.referenceId,
            classification: opts?.classification,
            customerDetails: opts?.customerDetails,
          }),
        })
        const data = await res.json()
        if (token !== addressToken.current) return // address changed; drop result
        if (!res.ok) {
          setResults((r) => ({
            ...r,
            [key]: { status: "error", error: data?.error ?? "Lookup failed" },
          }))
          return
        }
        setResults((r) => ({
          ...r,
          [key]: { status: "done", view: data as IncentiveView },
        }))
      } catch (err) {
        if (token !== addressToken.current) return
        setResults((r) => ({
          ...r,
          [key]: {
            status: "error",
            error: err instanceof Error ? err.message : "Lookup failed",
          },
        }))
      }
    },
    [address],
  )

  const value = useMemo<IncentivesContextValue>(
    () => ({
      address,
      applied: isComplete(address),
      setAddress,
      results,
      lookup,
      reset,
    }),
    [address, results, setAddress, lookup, reset],
  )

  return (
    <IncentivesContext.Provider value={value}>
      {children}
    </IncentivesContext.Provider>
  )
}

export function useIncentives() {
  const ctx = useContext(IncentivesContext)
  if (!ctx) throw new Error("useIncentives must be used within an IncentivesProvider")
  return ctx
}
