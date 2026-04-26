## Problem

In the screenshot you shared, the focused input's red ring is clipped on the left edge. Root cause: across all admin modals we use the standard pattern:

```
<DialogContent class="... p-6 ... flex-col overflow-hidden">
  <DialogHeader class="... -mx-6 -mt-6 px-6 ..." />
  <div class="overflow-y-auto flex-1 pt-4"> ← inner scroll container
    ...inputs...
  </div>
  <div class="... border-t pt-4">…footer…</div>
</DialogContent>
```

Inputs use `focus-visible:ring-2 ring-offset-2` (~4px outside the field). Because the inner scroll container has `overflow-y-auto` and sits flush to the modal's left/right edge, anything that paints outside the input's box (the focus ring) gets clipped horizontally.

## Fix

Add a small horizontal inset on the inner scroll container so the focus ring has room to render, without changing the modal's overall content width feel. Concretely, change the inner scroll wrapper from:

```
className="space-y-4 overflow-y-auto flex-1 pt-4"
```

to:

```
className="space-y-4 overflow-y-auto flex-1 pt-4 px-1 -mx-1"
```

The `-mx-1` keeps the visible content edge aligned with the header/footer (which sit at `p-6` on the parent), while `px-1` gives the focus ring 4px of breathing room on each side. Vertical clipping is also avoided by the existing `pt-4` plus `pb-` on the footer area; we'll add `pb-1` where needed so the bottom field's ring isn't clipped either.

## Files to update (same one-line change pattern)

All of these use the same scroll-container className:

1. `src/components/admin/CreateCustomerModal.tsx` (line 103)
2. `src/components/admin/RecordInteractionModal.tsx` (line 214)
3. `src/components/admin/RecordInquiryInteractionModal.tsx` (line 147)
4. `src/components/admin/RecordCareerInteractionModal.tsx` (line 145)
5. `src/components/admin/ShippingRateModal.tsx` (line 85)
6. `src/components/admin/NoteDetailModal.tsx` (line 112)
7. `src/components/admin/CustomerSearchModal.tsx` (line 75)
8. `src/components/admin/ProductSearchModal.tsx` (line 145)
9. `src/components/admin/website/WebsiteSectionEditor.tsx` (line 235)
10. `src/components/admin/website/TestPageBuilder.tsx` (lines 149, 307)
11. `src/pages/admin/Website.tsx` (line 70)
12. `src/pages/admin/settings/IntegrationsInfrastructure.tsx` (line 499)
13. `src/pages/admin/settings/IntegrationsSettings.tsx` (lines 685, 1057)
14. `src/components/cookies/CookiePreferencesModal.tsx` (line 105)
15. `src/components/AccessibilityWidget.tsx` (line 192) — already has `p-4`, will leave alone

For each file, append `px-1 -mx-1` (and `pb-1` where the last field sits flush with the footer) to the inner scroll container's className. No other markup or behavior changes.

## QA after change

Re-open `Create order → Create customer` modal, focus the First name input, and confirm the red ring is fully visible on left, right, top, and bottom. Spot-check Record Interaction and Shipping Rate modals as well.