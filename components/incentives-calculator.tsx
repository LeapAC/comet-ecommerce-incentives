"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "@/components/ui/lucide-icons"

interface IncentiveItem {
  name: string
  description: string
  amount: number
  type: "upfront" | "post-purchase"
}

interface IncentivesCalculatorProps {
  zipCode?: string
  productPrice?: number
  onIncentivesCalculated?: (revenueAdvance: number, postInstallCredits: number) => void
}

export default function IncentivesCalculator({ 
  zipCode = "", 
  productPrice = 899,
  onIncentivesCalculated 
}: IncentivesCalculatorProps) {
  const [userZip, setUserZip] = useState(zipCode)
  const [isEditing, setIsEditing] = useState(false)
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Calculate incentives based on requirements:
    // - Revenue Advance: $350 (upfront)
    // - PG&E Residential Charging Solutions: 50% of purchase price (post-purchase)
    // - Carbon Credits: $120 (post-purchase)
    
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
    
    const upfrontTotal = items
      .filter(i => i.type === "upfront")
      .reduce((sum, i) => sum + i.amount, 0)
    
    const postPurchaseTotal = items
      .filter(i => i.type === "post-purchase")
      .reduce((sum, i) => sum + i.amount, 0)
    
    const incentives = {
      items,
      upfrontTotal,
      postPurchaseTotal,
      grandTotal: upfrontTotal + postPurchaseTotal
    }
    
    setCalculatedIncentives(incentives)
    setIsCalculating(false)
    setIsEditing(false)
    
    if (onIncentivesCalculated) {
      onIncentivesCalculated(upfrontTotal, postPurchaseTotal)
    }
  }, [productPrice, onIncentivesCalculated])

  // Auto-run when zipCode prop changes (from shipping address)
  useEffect(() => {
    if (zipCode && zipCode.length === 5 && zipCode !== userZip) {
      setUserZip(zipCode)
    }
  }, [zipCode])

  // Auto-calculate when userZip is valid and we haven't auto-run yet
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
    if (onIncentivesCalculated) {
      onIncentivesCalculated(0, 0)
    }
  }

  const handleEditZip = () => {
    setIsEditing(true)
  }

  const upfrontItems = calculatedIncentives?.items.filter(i => i.type === "upfront") || []
  const postPurchaseItems = calculatedIncentives?.items.filter(i => i.type === "post-purchase") || []

  return (
    <div className="w-full space-y-4">
      {!calculatedIncentives || isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incentive-zip">ZIP Code</Label>
            <div className="flex gap-2">
              <Input
                id="incentive-zip"
                type="text"
                placeholder="Enter your ZIP code"
                value={userZip}
                onChange={(e) => setUserZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={handleManualCalculate}
                disabled={isCalculating || userZip.length !== 5}
              >
                {isCalculating ? "Checking..." : "Check Incentives"}
              </Button>
            </div>
            {zipCode && zipCode.length === 5 && (
              <p className="text-xs text-muted-foreground">
                Pre-filled from your shipping address
              </p>
            )}
          </div>
          
          {!calculatedIncentives && (
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex-1">
                <p className="text-muted-foreground">
                  Enter your ZIP code to see available incentives for your EV charger purchase.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Available Incentives</h3>
              <button 
                onClick={handleEditZip}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>ZIP: {userZip}</span>
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Clear
            </Button>
          </div>

          {/* Upfront Credits Section */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  Upfront Credits
                </Badge>
                <span className="text-xs text-muted-foreground">Applied at checkout</span>
              </div>
              
              {upfrontItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="font-semibold text-blue-600">-${item.amount.toLocaleString()}</p>
                </div>
              ))}
              
              <Separator className="bg-blue-200" />
              
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">Upfront Savings</p>
                <p className="font-bold text-blue-600">-${calculatedIncentives.upfrontTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Post-Purchase Credits Section */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  Post-Purchase Credits
                </Badge>
                <span className="text-xs text-muted-foreground">After installation</span>
              </div>
              
              {postPurchaseItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Separator className="bg-green-200" />}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <p className="font-semibold text-green-600">${item.amount.toLocaleString()}</p>
                  </div>
                </React.Fragment>
              ))}
              
              <Separator className="bg-green-200" />
              
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">Post-Purchase Savings</p>
                <p className="font-bold text-green-600">${calculatedIncentives.postPurchaseTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <p className="font-bold">Total Potential Savings</p>
            <p className="font-bold text-lg">${calculatedIncentives.grandTotal.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
            <svg 
              className="h-4 w-4 opacity-60" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-medium">Leap</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
