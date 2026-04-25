# Fix Stripe Integration (Self-Managed) - Full Plan

## 1. Simplify environment model
- `supabase/functions/_shared/stripe.ts`: remove `StripeEnv` type and per-env switching. Single client using `STRIPE_SECRET_KEY`. Single `STRIPE_WEBHOOK_SECRET` for `verifyWebhook`.
- `supabase/functions/payments-webhook/index.ts`: remove `?env=...` URL parsing.
- `supabase/functions/create-checkout/index.ts`: drop `environment` from request body.
- `src/components/StripeEmbeddedCheckout.tsx`: stop sending `environment`.
- `src/lib/stripe.ts`: keep `getStripe()`, drop `getStripeEnvironment` exports usage.

## 2. Fix create-checkout (server-trusted prices)
- Read `stripe_price_id` directly from `products` table by `productId` (already querying for stock).
- Validate format `^price_[A-Za-z0-9]+$`. Return 400 with clear message if missing/invalid.
- Build `line_items` with the DB price IDs - remove `stripe.prices.list({ lookup_keys })`.
- Keep stock validation. Keep `automatic_tax: { enabled: true }` and `billing_address_collection: 'required'`.

## 3. DB migration - unique index
```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id
  ON public.orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
```

## 4. Fix payments-webhook (trusted line_items)
- Use single `STRIPE_WEBHOOK_SECRET`.
- After `checkout.session.completed`, call `stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] })` to get authoritative prices/quantities.
- Build `order_items` from real line_items. Use metadata only to map back to internal `product_id`/variant.
- Keep idempotency via `stripe_session_id` lookup + unique index race protection.

## 5. ProductForm validation
- `src/components/admin/ProductForm.tsx`: validate `stripePriceId` matches `/^price_[A-Za-z0-9]+$/` on save (allow empty).
- Add helper text under the field: "Stripe Price ID (price_xxx). Find it in Stripe Dashboard -> Products -> select product -> Price ID. Do not paste the Product ID (prod_xxx)."
- Data cleanup via insert tool: `UPDATE products SET stripe_price_id = NULL WHERE stripe_price_id NOT LIKE 'price_%';`

## 6. Secret management
- After deploying webhook, give user the URL: `https://xfgxbrvqjbapmoijeshq.supabase.co/functions/v1/payments-webhook`.
- User registers endpoint in Stripe Dashboard with events: `checkout.session.completed`, `checkout.session.async_payment_failed`, `charge.refunded`, `charge.dispute.created`.
- Use `add_secret` tool to request `STRIPE_WEBHOOK_SECRET` (signing secret from Stripe).

## 7. Stripe Tax (user actions in Dashboard)
- Enable Stripe Tax.
- Set Tax origin address.
- Default tax code already implicit; optional: add `tax_code` field per product later.
- Code already sets `automatic_tax: { enabled: true }` so this will activate once Dashboard is configured.

## 8. Frontend cleanup
- `src/contexts/CartContext.tsx` / `StripeEmbeddedCheckout.tsx`: items can stop including `stripePriceId` (server reads from DB). Keep types but ignore on backend.

## Files changed
- supabase/functions/_shared/stripe.ts
- supabase/functions/create-checkout/index.ts
- supabase/functions/payments-webhook/index.ts
- src/lib/stripe.ts
- src/components/StripeEmbeddedCheckout.tsx
- src/components/admin/ProductForm.tsx
- new migration for unique index
- data cleanup UPDATE on products

## Required from user
- Switching `STRIPE_SECRET_KEY` between test/live as desired (already managed).
- After deploy: register webhook in Stripe + provide signing secret.
- Configure Stripe Tax origin in Dashboard.
