---
name: project-modal-focus-patterns
description: All custom div-based modals across jobs and users features lack focus trap, Escape handler, initial focus, and focus restoration — confirmed systemic gap
metadata:
  type: project
---

Every modal in the project is implemented as a custom `<div>`-based overlay with a `ref`-based backdrop click handler (`e.target === overlayRef.current`). Confirmed affected files as of 2026-06-13:
- `src/features/users/users.page.tsx` (EditRole, UserForm) — uses a shared `<Modal>` component
- `src/features/jobs/components/assign-reporter-modal.tsx`
- `src/features/jobs/components/assign-editor-modal.tsx`
- `src/features/jobs/components/submit-transcript-modal.tsx`

**Partial progress in 2026-06-13 diff:** All three jobs modals now have `useFocusTrap` applied to `containerRef`, an Escape key `window` listener via `useEffect`, and `role="dialog" aria-modal="true" aria-label="..."` on the inner container. Icons in close/action buttons are `aria-hidden="true"`.

**Still missing in all modals:**
- No programmatic focus move into dialog on open (first focusable element or the dialog container itself should receive focus)
- No focus restoration to the trigger button on close

Note: `useFocusTrap` handles tab cycling but the dialog still needs an initial focus call (e.g., `containerRef.current?.focus()` in a `useEffect`) and trigger-ref tracking for restoration.

Note: `aria-modal="true"` does not create a real focus trap — it is only a hint to some screen readers. Safari/VoiceOver does not honour it.

**Why:** Project uses a custom modal pattern rather than a headless library or native `<dialog>`. Gap is now partial — trap and Escape are fixed, but initial focus and restoration remain outstanding.

**How to apply:** Flag any custom modal/overlay in future reviews for all four requirements: (1) `role="dialog" aria-modal="true"` (present), (2) focus trap on open (now present via `useFocusTrap`), (3) Escape key to close (now present), (4) initial focus move into dialog on open (missing), (5) focus return on close (missing). Recommend migrating to native `<dialog>` with `.showModal()` as the systemic fix.

[[project-form-label-patterns]]

[[project-form-label-patterns]]
