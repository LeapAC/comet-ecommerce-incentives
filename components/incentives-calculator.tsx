"use client"

import React, { useEffect, useRef, useState } from "react"

interface IncentivesCalculatorProps {
  zipCode?: string
  state?: string
  onIncentivesCalculated?: (amount: number) => void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "rewiring-america-state-calculator": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "api-key": string
          zip?: string
          state?: string
          "owner-status"?: string
          "household-income"?: string
          "tax-filing"?: string
          "household-size"?: string
          projects?: string
        },
        HTMLElement
      >
    }
  }
}

export default function IncentivesCalculator({ zipCode, state, onIncentivesCalculated }: IncentivesCalculatorProps) {
  const apiKey = process.env.NEXT_PUBLIC_REWIRING_AMERICA_API_KEY || ""
  const calculatorRef = useRef<HTMLElement>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  useEffect(() => {
    // Check if scripts are already loaded
    if (document.querySelector('script[src="https://embed.rewiringamerica.org/state-calculator.js"]')) {
      setScriptsLoaded(true)
      return
    }

    // Add the module script
    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://embed.rewiringamerica.org/state-calculator.js"
    script.async = true
    script.onload = () => setScriptsLoaded(true)
    document.head.appendChild(script)

    // Add the stylesheet
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.type = "text/css"
    link.href = "https://embed.rewiringamerica.org/rewiring-fonts.css"
    document.head.appendChild(link)

    return () => {
      // Cleanup if needed (though we typically want to keep these loaded)
    }
  }, [])

  useEffect(() => {
    if (!scriptsLoaded) return

    const handleCalculatorSubmitted = (event: CustomEvent) => {
      console.log("=== FULL CALCULATOR RESPONSE ===")
      console.log("Event detail:", event.detail)
      console.log("Event detail stringified:", JSON.stringify(event.detail, null, 2))
      console.log("Event target:", event.target)
      console.log("Full event:", event)
      console.log("================================")
      
      // Simple parsing: find all $ amounts and sum them
      const incentiveText = JSON.stringify(event.detail)
      const dollarMatches = incentiveText.match(/\$([\d,]+)/g) || []
      
      let totalIncentives = 0
      dollarMatches.forEach(match => {
        const amount = parseInt(match.replace('$', '').replace(',', ''))
        totalIncentives += amount
      })
      
      console.log("Found dollar amounts:", dollarMatches)
      console.log("Total incentives calculated:", totalIncentives)
      
      if (onIncentivesCalculated && totalIncentives > 0) {
        onIncentivesCalculated(totalIncentives)
      }
    }

    const handleCalculatorReset = () => {
      console.log("Calculator was reset")
      if (onIncentivesCalculated) {
        onIncentivesCalculated(0)
      }
    }

    const calculator = calculatorRef.current
    if (calculator) {
      calculator.addEventListener("calculator-submitted", handleCalculatorSubmitted as EventListener)
      calculator.addEventListener("calculator-reset", handleCalculatorReset as EventListener)

      return () => {
        calculator.removeEventListener("calculator-submitted", handleCalculatorSubmitted as EventListener)
        calculator.removeEventListener("calculator-reset", handleCalculatorReset as EventListener)
      }
    }
  }, [scriptsLoaded, onIncentivesCalculated])

  if (!scriptsLoaded) {
    return <div className="text-center py-8 text-muted-foreground">Loading incentives calculator...</div>
  }

  return (
    <div className="w-full">
      <rewiring-america-state-calculator
        ref={calculatorRef}
        api-key={apiKey}
        zip={zipCode}
        state={state}
        owner-status="homeowner"
        projects="ev"
      />
    </div>
  )
}