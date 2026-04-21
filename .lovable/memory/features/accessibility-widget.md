---
name: Accessibility Widget
description: Public site accessibility widget with admin enable/color/position controls under the Optimization sidebar group
type: feature
---
A floating accessibility widget appears on every public-facing page (hidden on /admin/*). It applies CSS class toggles on `<html>` for: high-contrast, monochrome, sepia, invert, black & yellow, highlight links/titles, large/black cursor, readable font, stop blinks, keyboard nav. Font size cycles 100/115/130%. Per-visitor preferences persist in `localStorage` under key `a11y_settings`.

**Admin control** lives at `/admin/optimization/accessibility` (NOT under SEO/Settings). The Admin sidebar has a dedicated **Optimization** group containing: SEO (links to /admin/website?tab=seo), AI Search (placeholder "Soon" badge, disabled), Accessibility.

**Storage**: single-row `accessibility_settings` table with `enabled` (bool), `button_color` (hex), `position` (`bottom-left | bottom-right | top-left | top-right`). Public SELECT, admin-only UPDATE/INSERT.

**CSS overrides** for `.a11y-*` classes live in `src/index.css` after the @layer utilities block.
