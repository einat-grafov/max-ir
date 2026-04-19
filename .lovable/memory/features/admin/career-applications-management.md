---
name: Career Applications Management
description: Admin career applications list and detail page with status pipeline, internal notes, and interaction timeline
type: feature
---

Career Applications are managed at /admin/careers (list) and /admin/careers/:id (detail).

**List page**: Matches the Customers table design (light theme, `hover:bg-muted/50`, `cursor-pointer` rows). Columns: Name (with unread blue dot indicator), Status badge, Email, Country, Education, Date. Filters by status (new, reviewing, interviewing, hired, rejected), unread, and unsubscribed. Suppressed-email check via `suppressed_emails` table. Clicking a row navigates to detail and auto-marks it as read.

**Detail page**: Two-column layout (`1fr_350px`) mirroring EditCustomer:
- Header: breadcrumb + name + status dropdown badge + Unsubscribed badge + Delete/Discard/Save actions + "Unsaved changes" indicator + beforeunload guard.
- Left column cards: Applicant details (full_name, email, phone, country, education, position), About the applicant, Internal notes.
- Right column: `CareerApplicationTimeline` showing the "Application submitted" event plus interaction notes from `career_application_notes`. Notes can be added, edited (pencil icon on hover), and deleted (trash icon on hover).

**Modal**: `RecordCareerInteractionModal` — simplified version of RecordInteractionModal (no sales stage). Fields: date, contact person, interaction type, summary (required), action items, applicant feedback, follow-up.

**Database**:
- `career_applications` extended with: `phone`, `position`, `status` (default 'new'), `resume_url`, `notes`.
- `career_application_notes` table — admin-only RLS via `has_role(auth.uid(), 'admin')`. ON DELETE CASCADE from application.

**Status values**: new | reviewing | interviewing | hired | rejected (Tailwind: blue, amber, purple, emerald, red).
