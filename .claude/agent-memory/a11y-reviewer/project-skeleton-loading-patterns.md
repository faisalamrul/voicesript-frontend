---
name: project-skeleton-loading-patterns
description: Skeleton/loading state accessibility gaps — animate-pulse cards lack aria-busy and sr-only labels
metadata:
  type: project
---

Skeleton loading states in this project (e.g., `SummaryCard` in payments) use Tailwind `animate-pulse` with plain `div` blocks. These have no `aria-busy`, no `role`, and the placeholder blocks are not `aria-hidden`.

Pattern to enforce:
- The card/container should carry `aria-busy="true"` and `aria-label="{title} loading"` during the skeleton state.
- All skeleton `div` placeholder blocks should be `aria-hidden="true"` to avoid exposing empty, meaningless DOM nodes to AT.
- Once loaded, `aria-busy` should be removed or set to `false`.

**Why:** Screen reader users navigating to a summary section during load encounter unlabelled empty divs with no indication that content is pending. WCAG 4.1.3 requires status messages (including "loading") to be programmatically determinable.

**How to apply:** Flag any component that conditionally renders a skeleton branch without `aria-busy` on the wrapper and `aria-hidden` on the placeholder blocks.

[[project-mantine-react-table-patterns]]
