# Implement reliable gentle Android reminders and actions

Priority: High · Branch: `feature/android-reminders`

## User experience and benefit

A 3 PM office visit prompts the user at its slot. They can complete, reschedule or snooze with a reason. Dismissed commitments return through an agreed gentle escalation flow, reducing forgotten plans.

## Acceptance

- Resolve escalation ceilings and reminder-frequency/quiet-hours conflicts.
- Implement scheduled-task, Inbox, review and evening-summary notifications.
- Respect quiet/working hours and special-day overrides.
- Persist Done, Reschedule, Snooze and category-change actions.
- Restore after reboot; test Doze, denied permissions and battery restrictions.
- Verify on at least three device brands and record results. The current UI-only attention filter is not a reminder implementation.
