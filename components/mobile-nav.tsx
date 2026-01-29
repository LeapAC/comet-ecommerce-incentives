"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "@/components/ui/lucide-icons"
import { CartDrawer } from "@/components/cart-drawer"
import Link from "next/link"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden flex items-center gap-2">
      <CartDrawer />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex items-center space-x-2 mb-6">
            <img src="/comet.png" alt="Comet" className="h-6 w-6" />
            <span className="text-xl font-bold">Comet</span>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link
              href="/products"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/support"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
