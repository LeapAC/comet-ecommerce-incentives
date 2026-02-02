"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    if (!zip || zip.length !== 5) {
      return
    }

    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const revenueAdvance = 350
    const pgeRebate = Math.round(productPrice * 0.5)
    const carbonCredits = 120
    
    const items: IncentiveItem[] = [
      {
        name: "Revenue Advance",
        description: "Instant discount at checkout",
        amount: revenueAdvance,
        type: "upfront"
      },
      {
        name: "PG&E Residential Charging Solutions",
        description: "50% rebate after installation verification",
        amount: pgeRebate,
        type: "post-purchase"
      },
      {
        name: "Carbon Credits",
        description: "Environmental offset credits",
        amount: carbonCredits,
        type: "post-purchase"
      }
    ]
    
    const upfrontTotal = items.filter(i => i.type === "upfront").reduce((sum, i) => sum + i.amount, 0)
    const postPurchaseTotal = items.filter(i => i.type === "post-purchase").reduce((sum, i) => sum + i.amount, 0)
    
    setCalculatedIncentives({
      items,
      upfrontTotal,
      postPurchaseTotal,
      grandTotal: upfrontTotal + postPurchaseTotal
    })
    setIsCalculating(false)
    setIsEditing(false)
  }, [productPrice])

  // Notify parent when opt-in changes
  useEffect(() => {
    if (calculatedIncentives && onIncentivesCalculated) {
      if (optedIn) {
        onIncentivesCalculated(calculatedIncentives.upfrontTotal, calculatedIncentives.postPurchaseTotal, true)
      } else {
        onIncentivesCalculated(0, 0, false)
      }
    }
  }, [optedIn, calculatedIncentives, onIncentivesCalculated])

  // Auto-populate ZIP from props
  useEffect(() => {
    if (zipCode && zipCode.length === 5 && zipCode !== userZip) {
      setUserZip(zipCode)
    }
  }, [zipCode])

  // Auto-calculate when ZIP is valid
  useEffect(() => {
    if (userZip && userZip.length === 5 && !hasAutoRun && !calculatedIncentives) {
      setHasAutoRun(true)
      calculateIncentives(userZip)
    }
  }, [userZip, hasAutoRun, calculatedIncentives, calculateIncentives])

  const handleManualCalculate = () => {
    calculateIncentives(userZip)
  }

  const handleReset = () => {
    setCalculatedIncentives(null)
    setHasAutoRun(false)
    setOptedIn(false)
    if (onIncentivesCalculated) {
      onIncentivesCalculated(0, 0, false)
    }
  }

  const upfrontItems = calculatedIncentives?.items.filter(i => i.type === "upfront") || []
  const postPurchaseItems = calculatedIncentives?.items.filter(i => i.type === "post-purchase") || []

  // ZIP entry state (no results yet)
  if (!calculatedIncentives || isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={userZip}
            onChange={(e) => setUserZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            maxLength={5}
            className="flex-1 h-9"
          />
          <Button 
            type="button"
            size="sm"
            onClick={handleManualCalculate}
            disabled={isCalculating || userZip.length !== 5}
          >
            {isCalculating ? "..." : "Check"}
          </Button>
        </div>
        {zipCode && zipCode.length === 5 && (
          <p className="text-xs text-muted-foreground">Using shipping ZIP</p>
        )}
      </div>
    )
  }

  // Results state
  return (
    <div className="space-y-4">
      {/* Header with ZIP */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>ZIP {userZip}</span>
          <Pencil className="h-3 w-3" />
        </button>
        <button 
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>

      {/* Opt-in toggle */}
      <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
        <input
          type="checkbox"
          checked={optedIn}
          onChange={(e) => setOptedIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-sm">Apply incentives</span>
            <span className="text-sm font-semibold">${calculatedIncentives.grandTotal.toLocaleString()} savings</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ${calculatedIncentives.upfrontTotal} off today · ${calculatedIncentives.postPurchaseTotal} post-purchase
          </p>
        </div>
      </label>

      {/* Collapsible details - only show when opted in */}
      {optedIn && (
        <div className="space-y-2 text-sm">
          {/* Upfront Credits Accordion */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowUpfrontDetails(!showUpfrontDetails)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">Upfront Credit</span>
                <span className="text-muted-foreground">−${calculatedIncentives.upfrontTotal}</span>
              </div>
              {showUpfrontDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showUpfrontDetails && (
              <div className="px-3 pb-3 pt-1 border-t bg-muted/20">
                {upfrontItems.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5">
                    <div>
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-sm">−${item.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post-Purchase Credits Accordion */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowPostPurchaseDetails(!showPostPurchaseDetails)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">Post-Purchase Credits</span>
                <span className="text-muted-foreground">+${calculatedIncentives.postPurchaseTotal}</span>
              </div>
              {showPostPurchaseDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showPostPurchaseDetails && (
              <div className="px-3 pb-3 pt-1 border-t bg-muted/20">
                {postPurchaseItems.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5">
                    <div>
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-sm">+${item.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Powered by */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        <svg className="h-3 w-3 opacity-40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="font-medium">Leap</span>
        </p>
      </div>
    </div>
  )
}
