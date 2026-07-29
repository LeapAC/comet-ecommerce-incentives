"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Plus, Minus, Trash2 } from "@/components/ui/lucide-icons"
import { useCart } from "@/lib/cart-context"
import { CartIncentiveSummary } from "@/components/incentives/cart-incentive-summary"
import { usd } from "@/lib/incentives/model"
import Link from "next/link"

export function CartDrawer() {
  const { state, dispatch } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const updateQuantity = (id: number, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  const removeItem = (id: number) => dispatch({ type: "REMOVE_ITEM", payload: id })

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-card">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {state.itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[11px] tabular-nums">
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your cart
            {state.itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({state.itemCount} {state.itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShoppingCart className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Add a charger to get started.</p>
            <Button onClick={() => setIsOpen(false)} asChild>
              <Link href="/#products">Browse chargers</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 p-5">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3.5">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <p className="tnum shrink-0 text-sm font-semibold text-foreground">
                          {usd(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex items-center gap-1 rounded-lg border p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="grid h-7 w-7 place-items-center rounded-md text-foreground hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="tnum w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid h-7 w-7 place-items-center rounded-md text-foreground hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-3.5 border-t bg-muted/20 p-5">
              <CartIncentiveSummary active={isOpen} />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                <span className="tnum text-xl font-bold text-foreground">{usd(state.total)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => setIsOpen(false)} asChild>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
