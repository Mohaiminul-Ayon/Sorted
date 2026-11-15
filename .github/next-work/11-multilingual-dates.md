# Validate multilingual extraction and timezone/date intent

Priority: High · Branch: `feature/multilingual-dates`

## User experience and benefit

A mixed Bangla/English message containing several commitments produces complete proposals with correct names and local dates. Clarification appears only where intent is uncertain.

## Acceptance

- Confirm supported languages and timezone semantics.
- Evaluate two/three jobs, shared days, deadlines, lists, names, midnight/noon and weekdays using a real provider.
- Keep “buy apples and oranges” as one action.
- Preserve message order and opted-in context per action.
- Measure completeness and handle uncertainty without inventing commitments.
