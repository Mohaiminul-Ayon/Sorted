# Add optional privacy-controlled notification task suggestions

Priority: Medium · Branch: `feature/notification-suggestions`

## User experience and benefit

A user opts in to suggestions from selected apps. A client notification becomes a proposal only when accepted, reducing lost requests without blanket collection.

## Acceptance

- Resolve qualifying apps/content and current platform/store requirements.
- Default Notification Listener to off; explain access and provide app selection and an off switch.
- Persist notification content only after acceptance.
- Prevent sensitive content entering logs or automatic AI uploads.
- Test revocation, denied access, duplicates and offline behavior.
