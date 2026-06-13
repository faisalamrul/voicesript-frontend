---
name: project-inline-status-patterns
description: Patterns for inline status widgets (trend badges, busyness strips, empty states, live region completion messages) in earnings/stats pages
metadata:
  type: project
---

Observed in `earnings.page.tsx` (2026-06-13 review):

**TrendBadge:** Unicode arrow characters (↑ → ↓) rendered directly inside a `<span>` alongside text ("Improving", "Stable", "Slowing"). Screen readers announce "up arrow Improving" etc. Fix: wrap arrow in `<span aria-hidden="true">`.

**BusynessStrip:** Container has no role. Renders comparative stats ("This month: X min · Last month: Y min · +45% busier"). Also, the word "busier" is always appended even when delta is negative. Fix: add `role="status"` and `aria-label="Monthly activity comparison"` on wrapper; use conditional text ("less busy" vs "busier").

**Empty chart state:** `<div>No monthly data available yet.</div>` with no `role="status"` or `aria-live`. When the period selector changes and yields no data, the transition is silent to AT. Fix: `<div role="status" aria-live="polite">`.

**Live region completion:** `{isFetching ? 'Loading...' : ''}` clears to empty string on load complete — AT users get no confirmation. Fix: use a positive completion string ("Job history loaded.") instead of empty string. Live regions only announce changes, so this does not double-announce on first mount.

**Why:** These are status message failures (WCAG 4.1.3) and sensory-only information failures (WCAG 1.3.3) that accumulate across stats/dashboard pages.

**How to apply:** Flag any badge/strip component using raw Unicode symbols alongside readable text, any empty-state div lacking a live role, and any live region that clears to empty on completion.

[[project-skeleton-loading-patterns]]
