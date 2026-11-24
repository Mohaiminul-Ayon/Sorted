# Connect confirmed tasks to the device calendar

Priority: Medium · Branch: `feature/device-calendar`

## User experience and benefit

After approving “Meet Shafiq Sunday at 6 PM for 30 minutes,” the user can create a correctly timed calendar event linked to the task. Their commitments become visible alongside other events.

## Acceptance

- Resolve calendar choice, timezone intent and edited/deleted-event handling.
- Request permission in context and create only after approval.
- Retain event IDs; updates/retries must not create duplicates.
- Handle permission denial, deletion and DST/timezone changes.
- Verify correct date, duration and linkage on devices.

## Implementation (code-complete)

- Calendar permission is requested only when adding a scheduled task. Default writable calendar is used (BRD #5 still open). If the stored event was deleted, Sorted recreates one event and keeps the new id.
