"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Loader2 } from "@/components/ui/lucide-icons"
import type { Address } from "@/lib/zip-context"

interface Prediction {
  placeId: string
  description: string
}

interface AddressSearchProps {
  onSelect: (a: Address) => void
  placeholder?: string
  className?: string
}

export function AddressSearch({
  onSelect,
  placeholder = "Enter your address",
  className,
}: AddressSearchProps) {
  const [input, setInput] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchPredictions = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 3) {
      setPredictions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/places?action=autocomplete&input=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data = await res.json()
          const preds: Prediction[] = data.predictions ?? []
          setPredictions(preds)
          setOpen(preds.length > 0)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleSelect = async (p: Prediction) => {
    setInput(p.description)
    setOpen(false)
    setPredictions([])

    const res = await fetch(`/api/places?action=details&placeId=${p.placeId}`)
    if (res.ok) {
      const d = await res.json()
      if (d.zip) {
        onSelect({
          line1: d.line1,
          city: d.city,
          state: d.state,
          zip: d.zip,
          display: p.description,
        })
      }
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none z-10" />
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          fetchPredictions(e.target.value)
        }}
        placeholder={placeholder}
        className="w-full h-11 pl-9 pr-9 rounded-lg border border-input bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(p)
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/60 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
