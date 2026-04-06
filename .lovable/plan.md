

## Email Automation Flow for Admin Platform

### Overview
Build a complete email automation system within the admin platform that:
1. Automatically sends order confirmation + invoice emails when an order is created
2. Provides a template editor so admins can customize email content without touching code

### Current State
- 5 transactional email templates already exist as React Email components (hard-coded in edge functions)
- `send-transactional-email` edge function handles sending via the template registry
- `preview-transactional-email` edge function renders previews
- Order creation already triggers an order confirmation email
- Invoice sending exists via `SendInvoiceModal`

### What Will Be Built

#### 1. Email Templates Management Page (`/admin/settings/emails`)
- New admin page listing all email templates (order confirmation, invoice, inquiry confirmation, contact confirmation, careers confirmation)
- Each template shows: name, subject line, last edited date, and a preview thumbnail
- Click a template to open the editor

#### 2. Template Editor
- A full-page editor for each template with:
  - **Subject line** field (editable text with variable placeholders like `{{customerName}}`, `{{orderNumber}}`)
  - **Body editor** with sections: greeting, main content, closing message
  - Each section is a rich text field with basic formatting
  - **Variable picker** sidebar showing available merge tags per template type
  - **Live preview** panel (renders the email in an iframe using the preview edge function)
  - **Save** and **Reset to default** buttons

#### 3. Database: `email_templates` Table
- Stores customized template overrides (subject, greeting, body, closing per template key)
- If no override exists, the system falls back to the default hard-coded template
- Schema: `id`, `template_key` (unique), `subject`, `sections` (jsonb), `updated_at`, `updated_by`

#### 4. Updated Edge Functions
- Modify `send-transactional-email` to check `email_templates` table for overrides before rendering
- If a custom template exists, merge the saved content into the React Email component
- The React Email components become "base layouts" while content comes from the database

#### 5. Automatic Order Email Flow
- When an order is created in `CreateOrder.tsx`, automatically send both:
  - Order confirmation email (already partially done)
  - Invoice email (currently manual via modal)
- Add a toggle in order creation: "Send confirmation email to customer" (on by default)
- Add an "Email History" section to the order detail page showing sent emails and their status

#### 6. Sidebar Navigation Update
- Add "Emails" item under Settings in `AdminSidebar.tsx`

### Technical Details

**New files:**
- `src/pages/admin/settings/EmailSettings.tsx` — template list page
- `src/pages/admin/settings/EmailTemplateEditor.tsx` — individual template editor
- Migration for `email_templates` table with RLS (admin-only CRUD)

**Modified files:**
- `supabase/functions/send-transactional-email/index.ts` — check DB for overrides
- `supabase/functions/_shared/transactional-email-templates/*.tsx` — accept dynamic content props
- `src/components/admin/AdminSidebar.tsx` — add Emails nav item
- `src/App.tsx` — add routes
- `src/pages/admin/CreateOrder.tsx` — add auto-send toggle, send both emails on create
- `src/pages/admin/OrderDetail.tsx` — add email history section

**Database migration:**
```text
email_templates
├── id (uuid, PK)
├── template_key (text, unique) — e.g. 'order-confirmation'
├── subject (text) — custom subject with {{variables}}
├── sections (jsonb) — { greeting, body, closing }
├── created_at (timestamptz)
├── updated_at (timestamptz)
└── updated_by (uuid, nullable)

RLS: admin-only for all operations
```

