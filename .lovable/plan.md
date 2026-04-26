## Move Brand page to Settings

Reorganize the Brand page so it lives under Settings — both in the sidebar grouping and in its URL — to match its purpose as a one-time configuration area rather than day-to-day operational work.

### 1. Update sidebar (`src/components/admin/AdminSidebar.tsx`)
- **Remove** `Brand` entry from `mainItems` (Management group).
- **Add** `Brand` entry to `settingsItems`, placed at the top so it leads the Settings group:
  ```ts
  { title: "Brand", url: "/admin/settings/brand", icon: Palette },
  ```

### 2. Update routing (`src/App.tsx`)
- Change the route path from `brand` to `settings/brand`.
- Add a redirect from the old URL so any bookmarked links still work:
  ```tsx
  { path: "settings/brand", element: <Brand /> },
  { path: "brand", element: <Navigate to="/admin/settings/brand" replace /> },
  ```

### 3. Verify no other internal links reference `/admin/brand`
- Search the codebase for `/admin/brand` references and update any hardcoded links to point to `/admin/settings/brand`. (The redirect above is a safety net, but direct links should be updated for cleanliness.)

### Resulting structure
- **Management**: General, Leads, Orders, Products, Customers, Website, Careers
- **Settings**: Brand, Users, Emails, Billing, Integrations

### Out of scope
- No changes to the Brand page content/layout itself — only its location in navigation and its URL.
