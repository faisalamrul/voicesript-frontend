---
name: patterns-code-quality
description: Recurring code quality issues and conventions observed across code reviews in this project
metadata:
  type: project
---

## Recurring Issues

- **`SWAL_PRIMARY` constant duplication**: `SWAL_PRIMARY = '#1F3A2F'` is now declared at file-level in both `job-form.tsx` and `users.page.tsx`. The diff imports it from `@/shared/constants`, suggesting it has been moved — verify and flag any file that still redeclares it inline.
- **Silent no-op handlers wired to confirm dialogs**: `handleDelete` in `users.page.tsx` shows a "Not available" info Swal but is wired through a confirm dialog in `UsersTable` — the user confirms a destructive action and nothing happens. Pattern: always check that a stub handler prevents the confirm dialog from firing, not just the final action. This is a Blocker pattern confirmed across two reviews.
- **Literal `...` placeholder text**: Hint `<p>` elements in `job-form.tsx` render the string `"..."` to users after the `Hint` sub-component was removed. Watch for this in other form refactors.
- **`staleTime: 0` and `gcTime: 0` together**: `useEditors` and `useReporters` both set `gcTime: 0`, which forces a full refetch on every modal open/close cycle. `staleTime: 0` alone is sufficient for freshness — `gcTime: 0` is likely unintentional and removes cache deduplication benefit.
- **Unguarded `json.data.X` chains on API responses**: `fetchReporters` and `fetchEditors` return `json.data.users` without a null/array guard. After a `res.ok` check passes, unexpected server shapes still throw cryptic TypeErrors. Guard pattern: `if (!Array.isArray(json?.data?.users)) throw new Error(...)`.
- **Structurally identical interfaces declared separately**: `Reporter` and `Editor` in `jobs.api.ts` are byte-for-byte duplicates (confirmed by `export type Editor = Reporter`). Use a shared base type (e.g., `AssignableUser`) with type aliases to preserve nominal distinctness.
- **`assignReporter` reads `json` before checking `res.ok`**: If the server returns a non-JSON error body, `res.json()` throws before the error check, masking the real status code. The safe pattern is to check `res.ok` before calling `res.json()`, or use try/catch around the json parse (pattern in `assignEditor` is correct — check vs. `assignReporter`).
- **Unnecessary prop wrapper in `JobsTable`**: `onViewTranscript={(job) => onViewTranscript?.(job)}` wraps the prop in an anonymous arrow function on every render, creating a new function reference each time and defeating any memoization on the child.
- **`DUMMY_TRANSCRIPT` hardcoded constant in `transcript-detail.tsx`**: A multi-line hardcoded string at module scope — flag as a placeholder that must be removed before any production release.
- **Double-Swal UX on stubbed delete**: Confirmed pattern in `users-table.tsx` + `users.page.tsx` — user sees a confirm dialog, confirms, then sees "not available." The stub must either be removed from the UI or the confirm dialog must be bypassed until the feature is real.

- **`PaymentBadge` infers payment status from name field presence**: Using `reporter_name || editor_name` to show "Pending" conflates data-existence with payment state. The `status` field should be the single source of truth for payment status display. Watch for this pattern in any badge/pill component that mirrors server-side job status.
- **Anchor `.click()` without DOM attachment in `exportCSV`**: The generated `<a>` element is clicked without being appended to `document.body`. Firefox requires DOM attachment for programmatic clicks on non-user-trusted events. Always use `appendChild` / `removeChild` around `.click()` in download helpers.
- **Split filter controls across toolbar and page header**: In `payments.page.tsx`, `status` lives in `renderToolbarInternalActions` and `period` lives in the page header. Both feed the same query. Watch for this UX fragmentation pattern in future filter-heavy pages.

## Resolved Issues (previously flagged, now fixed)

- **Stale `useMemo` deps** in `users-table.tsx`: Fixed — `columns` now correctly lists `[handleDelete, onEditRole, currentUserId]` as dependencies.
- **Optimistic UI without real API** for `handleAddUser`: Fixed — `createUser` API is now called with proper try/catch and query invalidation.
- **Hardcoded `#1F3A2F` inline in every Swal call**: Fixed — `SWAL_PRIMARY` is now imported from `@/shared/constants`.
- **Mock data in `use-users.ts`**: Fixed — replaced with real `useQuery` calling `fetchUsers`.

- **`?? 'role-fallback'` in `useAuthStore` selector masking `enabled` guards**: In `use-earnings.ts`, `useAuthStore((s) => s.user?.role ?? 'reporter')` assigns a valid role when `user` is `null`, causing React Query's `enabled` guard to pass even for unauthenticated sessions. Pattern: always check `user != null` separately from `role` when using `enabled` to gate auth-dependent queries.
- **Untyped role string interpolated into URL path**: `fetchEarnings` accepts a `UserRole` and interpolates it directly into `/${role}/earnings` with no validation at the API boundary. Pattern: narrow the parameter to an explicit union (`'reporter' | 'editor'`) local to the API function rather than accepting the broader `UserRole` type.
- **Implicit fall-through on exhaustive `if`-chain for discriminated union**: `trendSub()` in `earnings.page.tsx` handles `'improving'`, `'stable'`, `'slowing'` explicitly but lets `'insufficient_data'` fall through to the default `return`. Prefer an explicit branch or TypeScript exhaustiveness check when converting a `Record<union, string>` to a function.
- **Semantically misleading boolean name derived from rate type**: `isEditor` is derived from `rateInfo?.type === 'flat_per_job'` — the name suggests a role check but the predicate is a billing-model check. If rate types and roles diverge, this breaks silently. Prefer `isFlatRate` or derive from the role directly.

## Established Conventions (updated 2026-06-13)

- Indonesian-language UI strings (titles, labels, error messages, validation) — this is intentional, not a bug.
- Mantine React Table v1 with `manualPagination: true` and server-side `rowCount` is the established table pattern.
- SweetAlert2 used for all confirmation dialogs and operation feedback toasts. Destructive confirms use red (`#dc2626`), not `SWAL_PRIMARY`.
- React Query v5 with `invalidateQueries` for cache busting after mutations.
- `useCallback` wrapping of async event handlers passed as table cell props (e.g., `handleDelete`) is now the established pattern in `users-table.tsx`.
- Aria live region (`role="status" aria-live="polite"`) added to pages for screen-reader feedback on async operations — maintain in future page-level mutations.
- Modals implement Escape-key close via `useEffect` + `window.addEventListener('keydown', ...)` — this is the established modal pattern, not a bug.
- `sorted` arrays derived from query data inside modal components should be wrapped in `useMemo([queryData])` — the pattern of sorting inline in the render body has been flagged as a performance issue.
- `JobStatus` enum values follow the server's terminology: `NEW | ASSIGNED | TRANSCRIBED | REVIEWED | COMPLETED | REJECTED` (updated from old `IN_PROGRESS | SUBMITTED | IN_REVIEW | DONE` values — the old names should not reappear).
- Error handling is inconsistent across API functions: `assignEditor` checks `res.ok` before `res.json()`, but `assignReporter`, `submitTranscript`, and `submitReview` call `res.json()` first — watch for this ordering bug in new API functions.
- `assign-reporter-modal.tsx` uses inline error state; `assign-editor-modal.tsx` uses Swal for errors — these two modals are inconsistent on error display strategy. Future modals should pick one approach.
- `useJobs` uses `refetchInterval: 5_000` with `staleTime: 0` — polling is intentional for live job status updates.
- **`formatRupiah` helper is duplicated across feature pages**: `formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }` appears verbatim in both `earnings.page.tsx` and `job-detail.page.tsx`. Extract to `@/shared/utils` and import.
- **Hardcoded business-logic constants in render code**: The per-minute rate `2000` (IDR) appears in at least two places — `PaymentCell` in `earnings.page.tsx` and `estimatedPay` in `job-detail.page.tsx`. Must live in a named constant (e.g., `RATE_PER_MINUTE_IDR`) shared across features.
- **Hardcoded monthly breakdown array index**: `monthly[5]` and `monthly[4]` used directly in `earnings.page.tsx` to pick "current" and "previous" months. Fragile when the server returns fewer items; use `.at(-1)` and `.at(-2)` instead.
- **Duplicate React Query hooks calling the same endpoint**: `use-job-detail.ts` in `jobs/` uses queryKey `['job', jobId]` and `use-job-detail.ts` in `reporter-performance/` uses `['job-detail', jobId]` — both target `GET /jobs/:jobId`. These should be consolidated to a single hook in `jobs/` and re-exported or imported cross-feature.
- **`job.location` accessed without null guard in `job-detail.page.tsx`**: `job.location?.toUpperCase()` is guarded but the broader `job` object from `useJobDetail(jobId)` is used immediately after the loading/error check without a null guard — if `useJobDetail` resolves to `undefined`, accessing `job.duration` crashes. Guard pattern: `if (!job) return null` after the loading/error branches.
- **Missing `aria-busy` on loading skeletons**: The loading skeleton in `JobDetailPage` has no `aria-busy="true"` on the containing element, inconsistent with the project's established aria live-region pattern.
