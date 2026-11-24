# Build the Android foundation with a local database

Priority: High · Branch: `feature/android-foundation` · GitHub issue **#2** · Pilot order **1**

Production stack: **React Native (Android first)** per [docs/PRD.md](../../docs/PRD.md) v2.0. Do not ship the Vite browser app as V1.

## User experience and benefit

A user captures a task title into Inbox on Android, closes the app and returns to the same plan. Manual management, reviews and export work in airplane mode. This turns the browser prototype into an installable mobile application.

## Acceptance

- React Native + TypeScript; local SQLite; minimum API 26.
- Resolve target SDK and distribution route with the owner.
- Persist entities, relationships, settings and histories using UUIDs, timestamps and soft deletes.
- Preserve Manual/AI modes, editable proposals and optional context.
- Add weekend/working-hours onboarding and contextual permission requests.
- Deliver a test APK and verify restart, upgrade and offline data preservation.
