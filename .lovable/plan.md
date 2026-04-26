## Goal
Add a **Create order** button to the Inquiry Detail page header so admins can convert a lead into an order in one click — using the customer that was auto-created from the inquiry, prefilled in the existing CreateOrder flow.

## Placement
Position in the top-right header, right after the Delete icon and before the unsaved-changes indicator:

`[Delete icon]  [+ Create order]   [Unsaved changes]  [Discard]  [Save changes]`

Rationale:
- Mirrors the "primary action in header" pattern already used on `EditCustomer`.
- Keeps Save/Discard as the rightmost destructive-pair so muscle memory is preserved.
- Visually distinct from Save (uses `variant="outline"` with a `Plus` icon) so it doesn't compete for attention.

## Behavior

1. **Style**: `variant="outline"` + `Plus` icon + label "Create order".
2. **Guards** (button disabled with tooltip explaining why):
   - **Unsaved changes present** → tooltip: *"Save changes before creating an order."*
   - **Missing required shipping fields** (`address`, `city`, `postal_code`, `country`) → tooltip: *"Add a shipping address before creating an order."*
   - **No linked customer_id** (edge case for legacy inquiries) → tooltip: *"This inquiry has no linked customer."*
3. **On click**: navigate to `/admin/orders/create` and pass router state:
   ```ts
   navigate("/admin/orders/create", {
     state: {
       preselectedCustomer: {
         id: inquiry.customer_id,
         first_name: form.first_name,
         last_name: form.last_name,
         email: form.email,
         company: form.company_name,
       },
       // optional: prefilled shipping address from the inquiry
       prefilledShipping: {
         address: form.address,
         apartment: form.apartment,
         city: form.city,
         state: form.state,
         postal_code: form.postal_code,
         country: form.country,
       },
     },
   });
   ```
   This reuses CreateOrder's existing `location.state.preselectedCustomer` mechanism (already supported), so no changes to CreateOrder are required for the customer prefill.

## Files to edit
- **`src/pages/admin/InquiryDetail.tsx`** — add button + handler + guard logic in the header.

## Out of scope (for this step)
- Wiring `prefilledShipping` into CreateOrder's address fields. The customer prefill works today; if you also want CreateOrder to auto-fill the shipping address inputs from the inquiry, that's a small follow-up edit to `CreateOrder.tsx` to read `location.state.prefilledShipping`. Let me know after this lands if you want that too.
