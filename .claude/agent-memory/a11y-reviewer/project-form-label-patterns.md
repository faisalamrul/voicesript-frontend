---
name: project-form-label-patterns
description: Recurring label/input association issues in job-form and modal forms — htmlFor/id linkage dropped when Label component was removed
metadata:
  type: project
---

A `Label` sub-component (rendering `<label htmlFor={...}>`) was removed from `job-form.tsx` and replaced with bare `<label>` elements with no `htmlFor`. Simultaneously, `id` attributes were removed from the corresponding inputs. This pattern broke all programmatic label associations in the form.

Recurring risk: when a shared `Label` component is refactored out, `htmlFor`/`id` pairs tend to be dropped silently.

**Why:** The redesign replaced the `Label` component with inline labels for visual styling reasons, but the accessibility attributes were not preserved.

**How to apply:** In any future review of form components, verify every `<label>` has a matching `htmlFor` and every input has a matching `id`. If a shared `Label` component is present, check that it forwards `htmlFor` to the native element. Flag any form refactor that removes a shared label component as high-risk for this regression.

Multi-input components (e.g., DurationInput with per-segment number inputs) need individual `<label htmlFor>` per segment, not a single wrapping `<label>`. Wrap with `<fieldset>`/`<legend>` for the group label.

[[project-modal-focus-patterns]]
