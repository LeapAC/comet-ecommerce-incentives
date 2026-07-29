import { PRODUCTS } from "@/lib/products"
import type { CartItem } from "@/lib/cart-context"
import type { DeviceRef } from "@/lib/incentives/context"

/**
 * Maps a cart into Leap device entries — one per unit, each with a unique
 * `partner_device_reference`. Shared by the cart summary and checkout so both
 * look up the same device set.
 */
export function cartToDevices(items: CartItem[]): DeviceRef[] {
  return items.flatMap((it) => {
    const prod = PRODUCTS.find((p) => p.id === it.id)
    if (!prod) return []
    return Array.from({ length: it.quantity }, (_, n) => ({
      deviceId: prod.deviceId,
      ref: `p${it.id}-${n + 1}`,
    }))
  })
}
