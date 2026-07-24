# Project Guardrails

## Preserve Existing Work

- Treat the current light-mode landing, its structure, spacing, typography, media, interactions, and navigation as the source of truth.
- Make the smallest change that satisfies the explicit request. Do not redesign adjacent sections or refactor unrelated components.
- A theme request is additive: preserve the light theme byte-for-byte where possible and do not change landing layout, navigation, catalog behavior, Vision, or media.
- Keep `Tienda -> /productos` only when explicitly requested. Do not add a separate catalog navigation item without explicit approval.

## Protected Areas

- Do not modify `assets/Catalogo/**`, `assets/Boceto/**`, or `public/boceto-final.png` unless the user explicitly requests an asset change.
- Do not modify `src/components/CompareSlider.jsx` or either Vision section for a theme-only request.
- Do not change product API, proxy, n8n workflows, routes, or quote behavior for a visual-only request.
- Never replace, crop, re-encode, or reinterpret user-provided media while changing UI code.

## Scope Checks

- Run `git status` before editing and identify every pre-existing modified or untracked file.
- If an unrelated file changes during the task, stop and ask before touching it or including it in a commit.
- If a focused UI request would modify more than five files, stop and explain why before proceeding.
- Do not use `git reset --hard`, `git clean`, `git checkout .`, broad repository restores, or destructive cleanup.
- For rollback, confirm the exact target commit first, create a backup branch, and use targeted non-destructive reverts or file-level patches.

## Visual Validation

- Tests, lint, typecheck, and build are necessary but do not prove visual correctness.
- For every visual change, compare the unchanged light state before and after on desktop and mobile.
- Validate real interactions, especially the Vision swipe, image aspect ratios, navigation, and responsive layout.
- Do not claim a visual task is complete without a browser or screenshot review, or clearly state that review was not possible.

## Git Delivery

- Create focused local commits only after the affected behavior has been manually reviewed.
- Never push unless the user explicitly requests it.
- Before each commit, inspect `git status`, `git diff`, and recent history; stage only intended files.
- Keep owner-confirmation and OpenSpec-pending tasks pending. Never invent hosting, privacy, consent, or acceptance evidence.
