

## Career Applications Lead List

### What We're Building
An admin page at `/admin/careers` that displays all career applications received through the website's careers form. It follows the same pattern as the existing Inquiries page — a table with read/unread toggling, application details, and an unread counter.

### Where It Lives
- New sidebar item **"Careers"** added under Management, below Website, using the `Briefcase` icon
- New route `/admin/careers` in the router

### Implementation

**1. New page: `src/pages/admin/CareerApplications.tsx`**
- Query `career_applications` table, ordered by newest first
- Table columns: Read status icon, Full Name, Email, Country, Education, About (truncated), Date
- Click row to toggle read/unread (same pattern as Inquiries)
- Unread count shown in header subtitle
- Matching dark admin theme styling

**2. Update sidebar: `src/components/admin/AdminSidebar.tsx`**
- Add `{ title: "Careers", url: "/admin/careers", icon: Briefcase }` to `mainItems`

**3. Update router: `src/App.tsx`**
- Add route `{ path: "careers", element: <CareerApplications /> }` inside the admin children

No database changes needed — the `career_applications` table already exists with a `read` boolean column and admin-only RLS policies.

