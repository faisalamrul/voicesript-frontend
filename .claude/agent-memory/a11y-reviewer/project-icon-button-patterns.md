---
name: project-icon-button-patterns
description: Decorative icons inside labelled buttons are not marked aria-hidden; role-selector toggle buttons inconsistently apply aria-pressed across form components
metadata:
  type: project
---

Two recurring icon/button patterns as of 2026-06-13:

**1. Decorative icons in labelled buttons not hidden from the accessibility tree**
Tabler icon components (`IconLoader2`, `IconCheck`, `IconX`, `IconShield`, `IconTrash`, `IconBriefcase`, `IconMapPin`, `IconDeviceFloppy`, `IconUserPlus`) render SVGs inline. Without `aria-hidden="true"` they appear as unnamed graphics, doubling the button label.

Fixed in 2026-06-13 diff: `assign-reporter-modal.tsx`, `assign-editor-modal.tsx`, `submit-transcript-modal.tsx`, `users-table.tsx` — icons in interactive elements are now `aria-hidden="true"`.

Still missing `aria-hidden` as of 2026-06-13 diff:
- `job-form.tsx` line 284: `IconX` in close button
- `job-form.tsx` line 295–296: `IconBriefcase` decorative in Case Name input wrapper
- `job-form.tsx` line 326: `IconMapPin` decorative in City input wrapper
- `job-form.tsx` line 368: `IconDeviceFloppy` in submit button
- `user-form.tsx` line 59: `IconUserPlus` in header (decorative)
- `user-form.tsx` line 67: `IconX` in close button (no aria-label, no aria-hidden)
- `user-form.tsx` line 129: `IconMapPin` decorative in City input wrapper
- `user-form.tsx` line 161: `IconShield` in each role card button
- `user-form.tsx` line 181: `IconUserPlus` in submit button
- `edit-role-form.tsx` line 34: `IconX` in close button (no aria-label, no aria-hidden)
- `edit-role-form.tsx` line 88: `IconShield` in each role card button
- `edit-role-form.tsx` line 112: `IconDeviceFloppy` in Save button

**2. Role-selector toggle buttons — aria-pressed now fixed; deeper issue remains**
`user-form.tsx` and `edit-role-form.tsx` now correctly add `aria-pressed={role === opt.value}`. `job-form.tsx` LocationSelector already had this. The pattern is now consistent.

Outstanding: all three forms use mutually exclusive single-choice role/location pickers modelled as toggle buttons with `aria-pressed`. The semantically correct pattern is `<fieldset>`/`<legend>` + `<input type="radio">`. `aria-pressed` implies each button is independently toggle-able (multi-select); `role="radio"` + `aria-checked` within a `radiogroup` would be more accurate. This is a moderate/nit-level issue since `aria-pressed` at least conveys state, but screen reader users may expect multiple selections to be possible.

**Why:** Tabler icons render SVGs inline. Without `aria-hidden` the browser exposes them as unnamed graphics in the accessibility tree.

**How to apply:** In any future review, flag every `<IconFoo />` inside a button or link that has other text content — it must have `aria-hidden="true"`. For single-choice pickers, recommend radio inputs inside a fieldset over aria-pressed buttons.

[[project-modal-focus-patterns]]
