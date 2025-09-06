import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Comet - Premium EV Chargers",
  description:
    "Modern electric vehicle charging solutions for your home and business. Shop our range of smart EV chargers and accessories.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
