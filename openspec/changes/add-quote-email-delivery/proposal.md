# Change: Add secure quote email delivery

## Why

The existing quote workflow persists requests but does not notify the official company inbox. Delivery needs authenticated ingress, transactional persistence and recovery without silently duplicating notifications.

## What Changes

- Harden the existing Vercel Node.js quote endpoint behind a rollout flag.
- Prepare an inactive authenticated n8n draft and PostgreSQL outbox functions.
- Format plain-text notification to the fixed company recipient.
- Prepare tests and an explicit authorization gate before execution or rollout.

## Impact

Backend quote ingress and notification only. Existing frontend and commercial snapshots remain unchanged. No Next.js migration, JSON migration, legal pages or domain changes. Production remains unchanged during preparation.
