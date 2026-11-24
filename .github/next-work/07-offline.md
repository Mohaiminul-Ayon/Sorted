# Support offline cold starts and safe application updates

Priority: Medium · Branch: `feature/offline-loading` · GitHub issue **#7** · Pilot order **2**

## User experience and benefit

A user loads Sorted once, later opens it without a connection, and manages or exports saved tasks. Connected AI can require a connection while Manual remains useful.

## Acceptance

- Choose web caching separately from Android persistence.
- Bundle assets/fonts and cache the application shell safely.
- Verify offline reload/launch and understandable AI network errors.
- Never cache credentials or provider responses publicly.
- Test updates, stale assets and rollback without deleting stored plans.
