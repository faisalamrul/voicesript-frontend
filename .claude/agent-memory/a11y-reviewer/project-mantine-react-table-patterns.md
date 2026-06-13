---
name: project-mantine-react-table-patterns
description: MRT v1 accessibility patterns observed in this project — alert banners, progress bars, and server-side pagination
metadata:
  type: project
---

Mantine React Table v1 is used for data tables in `src/features/`.

Observed patterns:

1. `mantineToolbarAlertBannerProps` with `children: 'string'` does NOT wrap the string in a live region. MRT v1 mounts the banner conditionally — screen readers will miss the error unless the children include `role="alert"` or an `aria-live` wrapper.

2. `showProgressBars: isFetching` renders a visual indeterminate bar with no accessible label. Recommend a companion `sr-only` span with `aria-live="polite"` for background refetch states.

3. `manualPagination: true` + `rowCount` is the correct pattern for server-side pagination — it populates MRT's ARIA table metadata with the real total, avoiding misleading "page 1 of 1" announcements.

**How to apply:** In any future review touching MRT table config, check alert banner children for `role="alert"`, and check progress bar usage for sr-only companions.

[[project-sweetalert2-patterns]]
