import Link from "next/link"
import { CometMark } from "@/components/comet-mark"

/** Shared storefront footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/40">
      <div className="container max-w-[1200px] py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2.5">
          <CometMark id="footer" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">Comet</span>
        </Link>
        <p className="text-sm text-muted-foreground text-center">
          Reference implementation · Incentives powered by the{" "}
          <span className="font-semibold text-foreground">Leap Incentives API</span>
        </p>
        <span className="text-sm text-muted-foreground">© 2026 Comet</span>
      </div>
    </footer>
  )
}
