# Build the Android foundation with a local database

Priority: High · Branch: `feature/android-foundation`

## User experience and benefit

A user creates a proposal task on Android, closes the app and returns to the same plan. Manual management, reviews and export work in airplane mode. This turns the browser experience into an installable mobile application.

## Acceptance

- Choose the Android implementation approach; minimum API 26.
- Resolve target SDK and distribution route with the owner.
- Persist entities, relationships, settings and histories using UUIDs, timestamps and soft deletes.
- Preserve Manual/AI modes, editable proposals and optional context.
- Add weekend/working-hours onboarding and contextual permission requests.
- Deliver a test APK and verify restart, upgrade and offline data preservation.
