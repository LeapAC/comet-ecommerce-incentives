"use client"

import React, { createContext, useContext, useState } from "react"

interface ZipContextType {
  zip: string
  applied: boolean
  onApply: (z: string) => void
}

const ZipContext = createContext<ZipContextType | null>(null)

export function ZipProvider({ children }: { children: React.ReactNode }) {
  const [zip, setZip] = useState("")
  const [applied, setApplied] = useState(false)

  const onApply = (z: string) => {
    const v = z.replace(/\D/g, "").slice(0, 5)
    setZip(v)
    setApplied(v.length === 5)
  }

  return (
    <ZipContext.Provider value={{ zip, applied, onApply }}>
      {children}
    </ZipContext.Provider>
  )
}

export function useZip() {
  const ctx = useContext(ZipContext)
  if (!ctx) throw new Error("useZip must be used within a ZipProvider")
  return ctx
}
