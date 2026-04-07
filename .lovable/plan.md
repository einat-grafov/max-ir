

## Plan: Add Shipping Rates to Both Purchase Flows

### Overview
Integrate the existing `shipping-rates` edge function into two flows:
1. **Customer checkout** (Cart page) — add a shipping address form and rate selection step before the "Check out" button
2. **Admin manual order** (CreateOrder page) — add a shipping calculator to the Payment card so admins can fetch and apply a shipping rate

---

### Flow 1: Customer Checkout (Cart page)

**What changes:**
- Add a collapsible "Shipping Address" form above the Order Summary disclaimers, with fields: Country (dropdown), Postal Code, City, State
- Add a "Calculate Shipping" button that calls the `shipping-rates` edge function
- Display returned rates as selectable radio options (carrier, service, price, transit days)
- Update the Order Summary to show the selected shipping cost instead of "Calculated later"
- Update the total to include shipping
- The "Check out" button remains disabled until a shipping rate is selected (in addition to existing checkbox requirements)

**Origin address:** Hardcoded as the company's warehouse address (will use a sensible default like Israel origin or configurable)

**Files modified:**
- `src/pages/Cart.tsx` — add address state, shipping rates fetch, rate selection UI, updated totals

---

### Flow 2: Admin Order Creation (CreateOrder page)

**What changes:**
- Make the existing "Add shipping or delivery" text in the Payment card clickable to open a shipping modal/dialog
- The modal contains: destination address fields (pre-filled from selected customer if available), package weight, a "Fetch Rates" button
- Display returned rates as selectable options
- On selection, the shipping cost is added to the order totals (subtotal + shipping + discount + tax = total)
- Add `shipping_cost` and `shipping_method` to the order insert payload (stored in the existing `notes` field or as new columns)

**Database change:**
- Add `shipping_cost` (numeric, default 0) and `shipping_method` (text, nullable) columns to the `orders` table via migration

**Files modified:**
- `src/pages/admin/CreateOrder.tsx` — add shipping modal, state, rate fetching, totals update
- New component `src/components/admin/ShippingRateModal.tsx` — reusable modal for fetching and selecting rates

---

### Technical Details

**Shared shipping rate fetcher:**
- Create a shared hook `src/hooks/useShippingRates.ts` that wraps the `supabase.functions.invoke("shipping-rates", ...)` call with loading/error/results state
- Used by both Cart page and admin ShippingRateModal

**Database migration:**
```sql
ALTER TABLE public.orders ADD COLUMN shipping_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN shipping_method text;
```

**Origin address:** Default to a configured origin (e.g., company HQ). For the admin flow, allow overriding origin. For customer flow, use hardcoded company origin.

**Order of implementation:**
1. Database migration (add shipping columns)
2. Create `useShippingRates` hook
3. Create `ShippingRateModal` component
4. Update `CreateOrder.tsx` (admin flow)
5. Update `Cart.tsx` (customer checkout flow)

