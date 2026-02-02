"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface IncentivesCalculatorProps {
  zipCode?: string
  state?: string
  onIncentivesCalculated?: (revenueAdvance: number, postInstallCredits: number) => void
}

// Mock state data for incentives
const STATE_INCENTIVES: Record<string, number> = {
  CA: 2000,
  CO: 1500,
  NY: 2000,
  MA: 1500,
  OR: 1500,
  WA: 1200,
  NJ: 1500,
  CT: 1000,
  VT: 1200,
  // Default for other states
  DEFAULT: 1000,
}

export default function IncentivesCalculator({ 
  zipCode = "", 
  state = "", 
  onIncentivesCalculated 
}: IncentivesCalculatorProps) {
  const [userZip, setUserZip] = useState(zipCode)
  const [calculatedIncentives, setCalculatedIncentives] = useState<{
    federal: number
    state: number
    utility: number
    total: number
    userState: string
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userZip || userZip.length !== 5) {
      return
    }

    setIsCalculating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock: derive state from ZIP (in real app, use proper ZIP->state lookup)
    const derivedState = state || "CA" // Default to CA for demo
    
    const federal = 7500
    const stateRebate = STATE_INCENTIVES[derivedState.toUpperCase()] || STATE_INCENTIVES.DEFAULT
    const utility = 500
    const total = federal + stateRebate + utility
    
    const incentives = {
      federal,
      state: stateRebate,
      utility,
      total,
      userState: derivedState.toUpperCase()
    }
    
    setCalculatedIncentives(incentives)
    setIsCalculating(false)
    
    // For now, we'll pass the total as revenueAdvance=0, postInstallCredits=total
    // The user can adjust this split in the actual implementation
    if (onIncentivesCalculated) {
      onIncentivesCalculated(0, total)
    }
  }

  const handleReset = () => {
    setCalculatedIncentives(null)
    setUserZip("")
    if (onIncentivesCalculated) {
      onIncentivesCalculated(0, 0)
    }
  }

  return (
    <div className="w-full space-y-4">
      {!calculatedIncentives ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incentive-zip">ZIP Code</Label>
            <div className="flex gap-2">
              <Input
                id="incentive-zip"
                type="text"
                placeholder="Enter your ZIP code"
                value={userZip}
                onChange={(e) => setUserZip(e.target.value.slice(0, 5))}
                maxLength={5}
                pattern="[0-9]*"
                required
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isCalculating || userZip.length !== 5}
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex-1">
              <p className="text-muted-foreground">
                Enter your ZIP code to see available federal, state, and local incentives for your EV purchase.
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Available Incentives</h3>
              <p className="text-sm text-muted-foreground">ZIP Code: {userZip} • {calculatedIncentives.userState}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Federal EV Tax Credit</p>
                  <p className="text-xs text-muted-foreground">Post-installation credit</p>
                </div>
                <p className="font-semibold text-green-600">${calculatedIncentives.federal.toLocaleString()}</p>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{calculatedIncentives.userState} State Rebate</p>
                  <p className="text-xs text-muted-foreground">Post-installation rebate</p>
                </div>
                <p className="font-semibold text-green-600">${calculatedIncentives.state.toLocaleString()}</p>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Utility Rebate</p>
                  <p className="text-xs text-muted-foreground">Estimated local utility incentive</p>
                </div>
                <p className="font-semibold text-green-600">${calculatedIncentives.utility.toLocaleString()}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">Total Potential Savings</p>
                <p className="font-bold text-lg text-green-600">${calculatedIncentives.total.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

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
