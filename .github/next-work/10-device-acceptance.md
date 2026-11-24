# Verify accessibility and three-brand Android acceptance

Priority: High · Branch: `feature/device-acceptance`

## User experience and benefit

A screen-reader user can create/review tasks, and a large-text user can still reach every control. Real-device verification makes the client experience dependable.

## Acceptance

- Exercise Manual and message-to-three-task confirmation with keyboard/screen reader.
- Check labels, focus, dialog scrolling, touch targets and contrast.
- Test narrow screens, large text, long context and errors.
- Measure capture speed on mid-range devices.
- Complete BRD section 9 checks on three Android brands and record results.

Checklist: [docs/DEVICE_ACCEPTANCE.md](../../docs/DEVICE_ACCEPTANCE.md). TalkBack labels and 44dp targets are in the RN UI; three-OEM boxes stay empty until a device pass.
