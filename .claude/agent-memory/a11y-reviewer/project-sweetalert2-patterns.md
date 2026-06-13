---
name: project-sweetalert2-patterns
description: SweetAlert2 accessibility anti-patterns found in this codebase — loading dialogs without live regions, success toasts before async confirmation
metadata:
  type: project
---

SweetAlert2 is used throughout `src/features/` for loading, success, and error feedback dialogs.

Recurring issues found in code review:

1. Loading dialogs with `allowEscapeKey: false` and `allowOutsideClick: false` use `Swal.showLoading()` which renders a visual-only spinner. No `aria-live` region or `aria-busy` attribute is set, so screen readers receive no announcement during async operations.

2. Success toasts (`icon: 'success'`) are sometimes fired before the underlying async operation completes (e.g., `handleDelete` in `users.page.tsx` fires success before the TODO API call exists). Pattern to watch for in future reviews.

**Why:** The project uses Indonesian-language dialog text (e.g., "Menyimpan...", "Dihapus!", "Gagal memuat data users.") — screen reader announcements are especially important for non-visual users who cannot rely on color or icon cues.

**How to apply:** In every future review touching Swal.fire calls, check: (1) does the loading dialog have an aria-live or aria-busy signal? (2) does the success dialog fire only after the async operation resolves?

[[project-mantine-react-table-patterns]]
