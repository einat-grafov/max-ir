# Rename "Leads" → "Contact" with tabbed sub-views

Restructure the admin "Leads" area into a unified **Contact** section with three tabs: **Sales**, **Support**, and **Careers**. Sales keeps today's product-page inquiries; Support is a new bucket for footer / Customer Service form submissions; Careers reuses the existing career applications list.

## 1. Database

Add a `source` column to the existing `inquiries` table so we can split product inquiries from contact-form ("support") submissions without creating a parallel table.

- New column: `inquiries.source text not null default 'sales'`
  - Values: `'sales'` (from product pages) or `'support'` (from footer ContactForm + Customer Service page).
- Backfill: existing rows stay as `'sales'` (matches current behavior — they all came from product/inquiry forms).
- No RLS change needed (existing policies cover all rows).

## 2. Form changes (tag the source on insert)

- `src/components/ProductInquiryForm.tsx` → insert with `source: 'sales'`.
- `src/components/ContactForm.tsx` (used in footer + Customer Service page) → insert with `source: 'support'`.

## 3. Sidebar

`src/components/admin/AdminSidebar.tsx`:
- Rename the "Leads" menu item to **"Contact"**.
- Remove the standalone **Careers** item from the sidebar (it becomes a tab inside Contact).
- Keep the unread badge, but count unread across both `inquiries` (any source) and `career_applications` so the user sees one combined indicator on the Contact entry.

## 4. New tabbed Contact page

Replace the current `src/pages/admin/Inquiries.tsx` with a tabbed shell using the existing `Tabs` UI component. URL stays `/admin/inquiries` with optional `?tab=sales|support|careers` (defaults to `sales`). Also add a redirect/alias so old `/admin/careers` still lands on the Careers tab.

```text
Contact
├── Tab: Sales      → existing inquiries list, filtered by source='sales'
├── Tab: Support    → same inquiries list UI, filtered by source='support'
└── Tab: Careers    → existing CareerApplications list (extracted as a component)
```

Implementation:
- Extract the table from today's `Inquiries.tsx` into a reusable `InquiriesTable` component that takes a `source: 'sales' | 'support'` prop and queries `inquiries` filtered by that value. Keep the existing row click → `/admin/inquiries/:id` detail page (no change to InquiryDetail).
- Extract the table from today's `CareerApplications.tsx` into a `CareerApplicationsTable` component (same behavior, click → `/admin/careers/:id`).
- New `Contact.tsx` page renders the page header (icon + title "Contact" + unread summary), the appropriate `NotificationEmailCard` per tab (inquiries email for Sales/Support, careers email for Careers), and the three tabs.

Tab labels and icons:
- **Sales** — `MessageSquare` (inquiries from product pages)
- **Support** — `LifeBuoy` (footer / Customer Service form)
- **Careers** — `Briefcase` (job applications)

## 5. Routing

`src/App.tsx`:
- Replace the `Inquiries` import with `Contact`.
- Route `/admin/inquiries` → `<Contact />` (tab driven by query string).
- Keep `/admin/inquiries/:id` → `<InquiryDetail />` unchanged.
- Keep `/admin/careers/:id` → `<CareerApplicationDetail />` unchanged.
- `/admin/careers` → redirect to `/admin/inquiries?tab=careers` (so existing links and the careers detail "back" button still work).

## 6. Other touch-ups

- `src/pages/admin/General.tsx` (Overview/Dashboard): update any "Leads" wording / link target to point to the new Contact page; if it shows a count of unread inquiries, no schema change needed.
- Inquiry detail page header: show a small badge indicating source ("Sales" or "Support") for context — purely cosmetic, no behavior change.

## Files to edit / create

- Migration: add `source` column to `inquiries`.
- Edit: `src/components/ProductInquiryForm.tsx`, `src/components/ContactForm.tsx`.
- Edit: `src/components/admin/AdminSidebar.tsx`.
- Create: `src/pages/admin/Contact.tsx`.
- Create: `src/components/admin/InquiriesTable.tsx`, `src/components/admin/CareerApplicationsTable.tsx` (extracted from existing pages).
- Delete or stop routing: `src/pages/admin/Inquiries.tsx`, `src/pages/admin/CareerApplications.tsx` (logic moves into the extracted table components).
- Edit: `src/App.tsx` (routes + redirect).
- Edit: `src/pages/admin/InquiryDetail.tsx` (small source badge, optional).
- Edit: `src/pages/admin/General.tsx` (rename Leads → Contact wording / link).

Approve to apply.