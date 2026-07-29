import type React from "react"
import type { Metadata } from "next"
import { Sora, Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { IncentivesProvider } from "@/lib/incentives/context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Display face — geometric, energy/tech character for headings + numerals.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700", "800"],
})

// Body face — clean, warm grotesque with more character than Inter/Arial.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Comet — Smart EV Chargers with built-in incentives",
  description:
    "Shop premium EV chargers and see the rebates, utility credits, and Virtual Power Plant earnings you qualify for — powered by the Leap Incentives API.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <IncentivesProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </IncentivesProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
