"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Package, Truck, Zap, Gift, Award } from "@/components/ui/lucide-icons"
import Link from "next/link"

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/comet.png" alt="Comet" className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">Comet</span>
          </Link>
        </div>
      </header>

      <div className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Message */}
          <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground">
              Your Comet EV Charger is on its way to revolutionize your charging experience.
            </p>
          </div>

          {/* Comet Premium Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full -ml-12 -mb-12" />
            <CardContent className="p-8 relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">Comet Premium</h2>
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      AUTO-ENROLLED
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    You've been automatically enrolled in Comet Premium at no additional cost!
                  </p>
                </div>
              </div>

              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Earn $50 Credit</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your charger to the Comet App to receive your welcome bonus
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Credit will be added to your Comet account immediately after connection</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Premium Benefits Include:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Priority customer support with dedicated assistance</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Advanced charging analytics and energy insights</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Exclusive access to new features and updates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Extended warranty coverage on your charger</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Timeline */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Your Delivery Timeline</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="w-0.5 h-full bg-primary/30 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold mb-1">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your order has been received and is being prepared for shipment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold mb-1">Processing & Packaging</p>
                    <p className="text-sm text-muted-foreground">1-2 business days</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your charger will be carefully packaged and prepared for shipping.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold mb-1">In Transit</p>
                    <p className="text-sm text-muted-foreground">3-5 business days</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track your shipment in real-time via the tracking link we'll email you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Delivered & Ready to Install</p>
                    <p className="text-sm text-muted-foreground">Expected: 5-7 business days</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your charger arrives and you're ready to start your EV charging journey!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> You'll receive tracking information via email once your order ships.
                  Installation instructions and the Comet App download link will be included in your package.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rebate CTA */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Don't Forget Your $500 Rebate</h3>
                  <p className="text-sm text-muted-foreground">
                    Start your rebate application now. We'll pre-fill 25% of the information using your order details.
                  </p>
                </div>
                <Button size="lg" className="whitespace-nowrap">
                  Start Rebate Application
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
