---
name: project-download-announcement-patterns
description: CSV export via programmatic anchor click gives no screen reader confirmation — needs sr-only live region
metadata:
  type: project
---

The `exportCSV` utility in `payments.page.tsx` triggers a download by creating an `<a>` element programmatically and calling `.click()`. The anchor is never appended to the DOM, so no announcement is made.

Pattern to enforce:
- Any export/download action triggered by a button must pair with a sr-only `aria-live="polite"` region that is updated with a short status string (e.g., "CSV download started.") after the download is initiated.
- The live region string should be reset after a short timeout or on next action to allow re-announcement if the user exports again.

**Why:** WCAG 4.1.3 requires status messages (including success confirmations) to be exposed without requiring focus movement. A file download is a non-trivial action; the user needs confirmation it occurred.

**How to apply:** On any button with an `onClick` that triggers a file download, verify a live region is updated in the same handler.
