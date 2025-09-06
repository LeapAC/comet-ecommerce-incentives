"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Zap, CreditCard, Truck, Shield, ArrowLeft, Check } from "@/components/ui/lucide-icons"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",

    // Billing Information
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingCountry: "US",

    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Options
    shippingMethod: "standard",
    paymentMethod: "card",
  })

  const shippingCost =
    formData.shippingMethod === "express" ? 29.99 : formData.shippingMethod === "overnight" ? 49.99 : 9.99
  const tax = state.total * 0.08 // 8% tax
  const finalTotal = state.total + shippingCost + tax

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setOrderComplete(true)
    dispatch({ type: "CLEAR_CART" })

    toast({
      title: "Order placed successfully!",
      description: "You will receive a confirmation email shortly.",
    })
  }

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Comet</span>
            </Link>
          </div>
        </header>

        <div className="container py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to your cart before checking out.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Comet</span>
            </Link>
          </div>
        </header>

        <div className="container py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
            <div className="space-y-2">
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Comet</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order for premium EV charging solutions</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Method</CardTitle>
                  <CardDescription>Choose your preferred delivery speed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={formData.shippingMethod === "standard"}
                        onChange={(e) => handleInputChange("shippingMethod", e.target.value)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Standard Shipping</span>
                          <span className="font-medium">$9.99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">5-7 business days</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={formData.shippingMethod === "express"}
                        onChange={(e) => handleInputChange("shippingMethod", e.target.value)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Express Shipping</span>
                          <span className="font-medium">$29.99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">2-3 business days</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        name="shipping"
                        value="overnight"
                        checked={formData.shippingMethod === "overnight"}
                        onChange={(e) => handleInputChange("shippingMethod", e.target.value)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Overnight Shipping</span>
                          <span className="font-medium">$49.99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Next business day</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Your payment details are secure and encrypted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Your payment information is encrypted and secure
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>{state.itemCount} items in your cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Complete Order - $${finalTotal.toFixed(2)}`}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      By placing your order, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
