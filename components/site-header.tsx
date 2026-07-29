import Link from "next/link"
import { Zap } from "@/components/ui/lucide-icons"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"

/** Shared storefront header — one source of truth so every page matches. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <div className="container flex h-16 items-center justify-between max-w-[1200px]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-[18px] w-[18px]" />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">Comet</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How incentives work
          </Link>
          <CartDrawer />
        </nav>
        <MobileNav />
      </div>
    </header>
  )
}
