## Merchandise (Print-on-Demand)

**Status:** Pre-launch — ship a minimal storefront live at launch.
**Provider:** Printful (API-native, Free tier). Chosen for in-house fulfillment / quality
control over Printify's partner network, matching the premium brand positioning. Printful is
used purely as a fulfillment API — it never touches payment.

### Architecture
Merch is built natively into the Next.js app — NOT a separate Shopify store. It reuses the
existing auth and Stripe stack so there is one login and one checkout.

Order flow:
1. Products defined in our DB (synced from the Printful catalog; product images come from
   Printful's mockup-generator endpoint).
2. `/shop` → product list → product detail (variant/size) → cart (client state) → Stripe Checkout.
3. On Stripe `checkout.session.completed` webhook → server submits the Printful order via API.
4. Printful fulfillment webhooks update order status in our DB → surfaced in the user's order history.

### Routes / files
- `app/shop/page.tsx` — product grid
- `app/shop/[slug]/page.tsx` — product detail + variant/size selection
- `app/shop/cart/` — cart (client store)
- `app/api/checkout/route.ts` — creates Stripe Checkout session
- `app/api/webhooks/stripe/route.ts` — on paid, submit Printful order (idempotent)
- `app/api/webhooks/printful/route.ts` — fulfillment / shipping status updates
- `lib/printful.ts` — Printful API client (catalog, mockups, order create, shipping rates)
- DB tables: `products`, `product_variants`, `merch_orders`, `merch_order_items`

### Environment variables (names only — never commit secrets)
- `PRINTFUL_API_TOKEN`
- `PRINTFUL_STORE_ID`
- `PRINTFUL_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (existing)

### Shipping & tax
- Pull live shipping rates from Printful's shipping-rates endpoint at checkout, OR start with
  flat-rate zones for launch. Sales tax via Stripe Tax if enabled.

### Constraints / gotchas
- Printful API uses Bearer-token auth.
- NEVER submit a Printful order before payment is confirmed — only inside the Stripe webhook,
  and make it idempotent (guard against duplicate webhook deliveries by Stripe event id).
- Print-ready logo assets live in `assets/merch/` (high-res transparent PNG/SVG at required DPI).
- MVP scope: 1 core logo, 2 products (tee + mug). Expand only after validating demand.
- Keep this section trimmed — CLAUDE.md adherence drops past ~200 lines total.
- Payments: **Stripe** (confirmed). Checkout + fulfillment trigger both live in the Stripe webhook.
