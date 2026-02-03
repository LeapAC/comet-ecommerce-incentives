"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Pencil, ChevronDown, ChevronUp } from "@/components/ui/lucide-icons"

interface IncentiveItem {
  name: string
  description: string
  amount: number
  type: "upfront" | "post-purchase"
}

interface IncentivesCalculatorProps {
  zipCode?: string
  productPrice?: number
  onIncentivesCalculated?: (revenueAdvance: number, postInstallCredits: number, optedIn: boolean) => void
}

export default function IncentivesCalculator({ 
  zipCode = "", 
  productPrice = 899,
  onIncentivesCalculated 
}: IncentivesCalculatorProps) {
  const [userZip, setUserZip] = useState(zipCode)
  const [isEditing, setIsEditing] = useState(false)
  const [optedIn, setOptedIn] = useState(false)
  const [showUpfrontDetails, setShowUpfrontDetails] = useState(false)
  const [showPostPurchaseDetails, setShowPostPurchaseDetails] = useState(false)
  const [calculatedIncentives, setCalculatedIncentives] = useState<{
    items: IncentiveItem[]
    upfrontTotal: number
    postPurchaseTotal: number
    grandTotal: number
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasAutoRun, setHasAutoRun] = useState(false)

  const calculateIncentives = useCallback(async (zip: string) => {
    if (!zip || zip.length !== 5) return

    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const revenueAdvance = 350
    const pgeRebate = Math.round(productPrice * 0.5)
    const carbonCredits = 120
    
    const items: IncentiveItem[] = [
      { name: "Revenue Advance", description: "Instant discount at checkout", amount: revenueAdvance, type: "upfront" },
      { name: "PG&E Residential Charging Solutions", description: "50% rebate after installation verification", amount: pgeRebate, type: "post-purchase" },
      { name: "Carbon Credits", description: "Environmental offset credits", amount: carbonCredits, type: "post-purchase" }
    ]
    
    const upfrontTotal = items.filter(i => i.type === "upfront").reduce((sum, i) => sum + i.amount, 0)
    const postPurchaseTotal = items.filter(i => i.type === "post-purchase").reduce((sum, i) => sum + i.amount, 0)
    
    setCalculatedIncentives({ items, upfrontTotal, postPurchaseTotal, grandTotal: upfrontTotal + postPurchaseTotal })
    setIsCalculating(false)
    setIsEditing(false)
  }, [productPrice])

  useEffect(() => {
    if (calculatedIncentives && onIncentivesCalculated) {
      onIncentivesCalculated(
        optedIn ? calculatedIncentives.upfrontTotal : 0,
        optedIn ? calculatedIncentives.postPurchaseTotal : 0,
        optedIn
      )
    }
  }, [optedIn, calculatedIncentives, onIncentivesCalculated])

  useEffect(() => {
    if (zipCode && zipCode.length === 5 && zipCode !== userZip) {
      setUserZip(zipCode)
    }
  }, [zipCode])

  useEffect(() => {
    if (userZip && userZip.length === 5 && !hasAutoRun && !calculatedIncentives) {
      setHasAutoRun(true)
      calculateIncentives(userZip)
    }
  }, [userZip, hasAutoRun, calculatedIncentives, calculateIncentives])

  const handleReset = () => {
    setCalculatedIncentives(null)
    setHasAutoRun(false)
    setOptedIn(false)
    onIncentivesCalculated?.(0, 0, false)
  }

  const upfrontItems = calculatedIncentives?.items.filter(i => i.type === "upfront") || []
  const postPurchaseItems = calculatedIncentives?.items.filter(i => i.type === "post-purchase") || []

  // ZIP entry state
  if (!calculatedIncentives || isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter ZIP code"
              value={userZip}
              onChange={(e) => setUserZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              className="flex-1 h-9 bg-background"
            />
            <Button 
              type="button"
              size="sm"
              variant="default"
              onClick={() => calculateIncentives(userZip)}
              disabled={isCalculating || userZip.length !== 5}
            >
              {isCalculating ? "..." : "Check"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {zipCode && zipCode.length === 5 ? "Using your shipping ZIP" : "Enter ZIP to check available incentives"}
          </p>
        </div>
      </div>
    )
  }

  // Results state - unified component
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Incentives for {userZip}</span>
          <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
          Reset
        </button>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Opt-in */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={optedIn}
            onChange={(e) => setOptedIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Include incentives</span>
              <span className="text-sm font-semibold">${calculatedIncentives.grandTotal} total</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ${calculatedIncentives.upfrontTotal} off today + ${calculatedIncentives.postPurchaseTotal} after install
            </p>
          </div>
        </label>

        {/* Details (only when opted in) */}
        {optedIn && (
          <div className="space-y-2 pt-2">
            <Separator />
            
            {/* Upfront Credit Accordion */}
            <div className="rounded border overflow-hidden">
              <button
                onClick={() => setShowUpfrontDetails(!showUpfrontDetails)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium">Upfront Credit</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700">${calculatedIncentives.upfrontTotal}</span>
                  {showUpfrontDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {showUpfrontDetails && (
                <div className="px-3 pb-3 pt-1 border-t bg-muted/20 space-y-2">
                  {upfrontItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span>${item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post-Purchase Accordion */}
            <div className="rounded border overflow-hidden">
              <button
                onClick={() => setShowPostPurchaseDetails(!showPostPurchaseDetails)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium">Post-Purchase Credits</span>
                <div className="flex items-center gap-2">
                  <span className="text-violet-600">${calculatedIncentives.postPurchaseTotal}</span>
                  {showPostPurchaseDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {showPostPurchaseDetails && (
                <div className="px-3 pb-3 pt-1 border-t bg-muted/20 space-y-2">
                  {postPurchaseItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span>${item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/20 border-t flex items-center justify-center gap-1.5">
        <svg className="h-3 w-3 opacity-40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-[10px] text-muted-foreground">
          Powered by <span className="font-medium">Leap</span>
        </span>
      </div>
    </div>
  )
}
