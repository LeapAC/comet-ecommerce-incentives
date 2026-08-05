# Comet — Leap Incentives reference implementation

A minimal EV‑charger e‑commerce site that shows how an online store uses the
**Leap Incentives API** to drive conversion. It is a *reference implementation*:
the code is intentionally small and the integration points are the whole point.

Incentives show up right where they drive conversion:

1. **Product detail page (PDP)** — *awareness.* A shopper enters their address
   and sees the real rebates, utility programs, and Virtual Power Plant (VPP)
   earnings their charger qualifies for.
2. **Cart** — *reinforcement.* The eligible‑savings summary follows the shopper
   into the cart.
3. **Checkout** — *applied.* The shipping address drives a live lookup; the
   order summary shows the money coming back after purchase and the effective
   cost.

Plus a **post‑purchase confirmation** page that previews the real Leap email the
customer will receive.

Everything else (catalog, cart) is deliberately thin — just enough to reach a
PDP and complete an order.

---

## How the Leap Incentives API is called

> **Leap docs.** The public Leap Incentives API reference — eligibility,
> programs, Connect URLs, and applications — lives at
> **[docs.incentives.leap.energy](https://docs.incentives.leap.energy)**. Comet
> integrates Leap's **Global Connect** partner‑lookup surface
> (`POST /beta/incentives/lookups`, Bearer partner key). This
> README documents that surface and the reference‑implementation specifics
> (device‑ID mapping, server‑only key, staging, email preview) rather than
> restating the platform docs.

The lookup is **always server‑side**. The partner API key never reaches the
browser: the client calls an internal Next.js route handler, which calls Leap.

```
 Browser (PDP / Checkout)
   │  POST /api/incentives/lookup   { address, devices[] }
   ▼
 Route handler  app/api/incentives/lookup/route.ts
   │  lookupIncentives()  ── Authorization: Bearer $LEAP_API_KEY
   ▼
 Leap Incentives API
   POST $LEAP_API_BASE_URL/beta/incentives/lookups
```

- **Client** ([`lib/leap/client.ts`](lib/leap/client.ts)) is marked
  `import "server-only"`, so it can never be bundled into client code.
- **Auth** is a partner bearer token: `Authorization: Bearer <LEAP_API_KEY>`.
- **Request** (see [`lib/leap/types.ts`](lib/leap/types.ts)):

  ```jsonc
  {
    "reference_id": "comet-order-…",          // partner's stable customer id
    "address": {
      "address_line_1": "123 Market St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94103",
      "country_code": "US"
    },
    "customer_devices": [
      { "device_id": "<catalog UUID>", "partner_device_reference": "1" }
    ],
    "customer_classification": "RESIDENTIAL"
  }
  ```

- **Response** carries an `incentive_summary` (`install_amount`,
  `ongoing_amount`, `upfront_amount`), a `program_details[]` breakdown, the
  serving `utilities`, and a `connect_url` deep link into Leap's claim flow.
  We normalize it once in [`lib/incentives/model.ts`](lib/incentives/model.ts)
  (`toIncentiveView`) so the UI never touches the raw envelope.

### Where each surface calls it

| Surface | File | Address source | Devices |
|---|---|---|---|
| PDP | `app/products/[id]/page.tsx` | address entered on the PDP (with a one‑click example) | the one product's `deviceId` |
| Checkout | `app/checkout/page.tsx` | the shipping address | every unit in the cart |
| Confirmation email | `app/api/order/confirm/route.ts` | — | uses the checkout result |

A shared client context ([`lib/incentives/context.tsx`](lib/incentives/context.tsx))
holds the address and caches lookups, so entering an address on the PDP carries
into checkout.

---

## Product → device‑catalog mapping

Every product carries a **real Leap device‑catalog UUID**
([`lib/products.ts`](lib/products.ts)). The lookup sends it as
`customer_devices[].device_id`, and the API decides eligibility from the device
category + serving utility. IDs were discovered via the catalog search endpoint:

```
GET $LEAP_API_BASE_URL/beta/incentives/devices/search?q=<text>
Authorization: Bearer <LEAP_API_KEY>
```

| Product | Maps to catalog device | Device UUID |
|---|---|---|
| Comet Home Pro | Wallbox E50 | `319e5db1-eb1c-4374-b073-3234a14b1a1d` |
| Comet Compact | Emporia Pro Level 2 EV Charger | `c9e34651-4165-4aff-b236-724cfa3115ab` |
| Comet Business | ChargePoint CT4000 Level 2 Commercial | `087b026a-6981-4dfc-b971-13f3b1e7c1e4` |
| Comet Ultra | Star Charge Aurora Level‑2 48A | `eb22ee84-4cf3-4210-b6be-dd212b667c59` |
| Smart Splitter | NeoCharge Smart Splitter | `b72c0703-32f0-4cff-9949-a77377384d97` |

> Comet's products are fictional, so the pairings are **illustrative** — each
> maps to a representative real device of the right class. In your own store,
> map each SKU to the catalog device it actually is (or pass `device_names` and
> let Leap resolve them via your equipment map). To map a new product, search
> the catalog for it and drop the returned `id` into `lib/products.ts`.

---

## Post‑purchase confirmation email (preview only — Leap‑managed)

**Leap owns email delivery on behalf of its partners.** An open‑source reference
store like Comet does not — and must not — send Leap's transactional emails. So
the confirmation page **renders the real Leap email as a preview** (exactly what
the customer will receive once Leap sends it) and sends nothing.

- The template is the real *"We've received your information"* email, vendored
  **verbatim** from
  `connect-incentives/email-templates/email-template-resend.html` — the same file
  that connect‑incentives deploys to Resend and the incentives‑service
  `applications` edge function sends. It lives at
  [`lib/email/leap-confirmation-template.ts`](lib/email/leap-confirmation-template.ts).
- A tiny Handlebars‑subset renderer fills it with the order's data:
  [`lib/email/leap-template.ts`](lib/email/leap-template.ts).
- The route is **preview‑only, no send**:
  [`app/api/order/confirm/route.ts`](app/api/order/confirm/route.ts).

There is intentionally **no send path and no email API key**. To change the
email, edit the source template in `connect-incentives` and re‑copy it here.

---

## Environment variables

Create `.env.local` (git‑ignored):

```bash
# Leap Incentives API — staging
LEAP_API_BASE_URL=https://api.staging.leap.energy
LEAP_API_KEY=<your Comet partner bearer token>   # sent as: Authorization: Bearer …
```

`LEAP_API_KEY` is a secret — keep it server‑side only. On Vercel, add it as a
**Sensitive** environment variable. (No email API key is needed — the
confirmation email is preview‑only; see above.)

---

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Then:

1. Open a charger → **Incentives & programs** → *Use example address* →
   *Check incentives*. Real programs for that address render.
2. Add to cart → the cart shows your eligible savings → **Checkout** → fill the
   shipping address → the order summary shows incentives applied.
3. *Complete order* → confirmation page with a preview of the real Leap email.

`pnpm build` produces the production build.

---

## Project structure

```
app/
  page.tsx                          Storefront — hero, "how it works", product grid → PDPs
  products/[id]/page.tsx            PDP  ── incentives awareness
  checkout/page.tsx                 Checkout ── incentives applied + confirmation
  api/incentives/lookup/route.ts    Server route → Leap lookup (Bearer, server-only)
  api/order/confirm/route.ts        Server route → real Leap email preview (no send)
lib/
  leap/client.ts                    server-only Leap API client (Bearer auth, timeout)
  leap/types.ts                     Leap request/response types
  incentives/model.ts               Normalizes API response → display model
  incentives/context.tsx            Shared address + lookup cache (client)
  incentives/cart.ts                Cart → Leap device list
  email/leap-confirmation-template.ts   Real Leap email template (vendored verbatim)
  email/leap-template.ts            Handlebars-subset renderer + order → template vars
  products.ts                       Products + their device-catalog UUIDs
components/
  site-header.tsx · site-footer.tsx     Shared chrome (consistency)
  cart-drawer.tsx                   Cart + live incentive summary
  incentives/address-panel.tsx      Address entry (drives the lookup)
  incentives/incentive-results.tsx  Shared result card (PDP · checkout · confirmation)
  incentives/cart-incentive-summary.tsx   Compact savings summary in the cart
```

---

## Implementation notes

- **Auth is `Authorization: Bearer`, not `x-api-key`.** The incentives gateway
  rejects `x-api-key` (403). Bearer is what the partner key uses.
- **Payment types drive the money flow.** The API classifies every tier by
  `payment_type`, and the UI applies each one distinctly:
  - `UPFRONT` → a **point‑of‑sale discount**, subtracted from the due‑today
    total at checkout ("At checkout" / "Instant incentive credit"). *Reserved:
    `upfront_amount` is always 0 today, so live totals are unchanged.*
  - `INSTALL` → paid **after install**; surfaced as "back after purchase"
    (`oneTimeBack`) and used to compute the effective cost.
  - `ONGOING` → **recurring**, shown as `$/yr` (e.g. VPP participation).

  `oneTimeBack` is INSTALL money only — it never includes the UPFRONT checkout
  discount or ongoing earnings.
- **Customers dedupe by address.** The lookup keys a customer on
  `(partner, address_line_1, address_line_2, zip)`, so repeated lookups at the
  same address resolve to the same customer regardless of `reference_id`.
- Points at **staging** (`api.staging.leap.energy`). No production data.
