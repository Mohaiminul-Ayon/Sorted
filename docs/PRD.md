# Sorted Product Requirements Document

Version 1.4 · 15 November 2026 · Status: distinct Manual and AI task creation

Source: `Sorted — Business Requirements Document v1.3.docx` (8 November 2026), amended by the user's requests for both manual and AI planning, automatic extraction/categorisation/scheduling, editable confirmation, optional task context, and no Gemini logo. These requests supersede the original manual-only capture, mandatory context retention, and AI exclusion. Other open decisions remain open.

## 1. Product purpose

Sorted turns everyday messages into an organised, proposed plan. It identifies separate actions, estimates importance and urgency, proposes categories and times, and waits for the user to confirm. Users can edit any suggestion or save the plan as proposed. Its promise is relief from remembering and organising everything, rather than guaranteed task completion.

The primary user balances professional responsibilities and personal commitments, receives tasks through conversations and messages, and loses context in a single undifferentiated list.

### Goals

- Capture a thought in under 15 seconds, with the capture interface opening in under one second on a mid-range device.
- Automatically extract actions and prepare an editable schedule, removing the need to manually split and classify each message.
- Require an explicit confirmation before proposed tasks enter the saved plan or trigger device actions.
- Separate ready tasks from tasks needing thought and low-priority possibilities.
- Surface missed plans and undecided thoughts without blame or pressure.
- Connect individual actions to Projects and Meetings while retaining their original context.
- Support every core activity offline, without an account.

### Non-goals for V1

Cloud storage of the task database, sync, accounts, collaboration, iOS, a production web app, automatic meeting transcription, recurring tasks, attachments, search, advanced analytics, and a mental-load check-in are excluded. Intelligent extraction is now in scope. A hosted model such as Gemini would require network access and transmission of the selected message; local task management remains offline. The React browser prototype is a design-validation tool, not an expansion of the V1 platform scope.

## 2. Platform and experience

Production V1 targets Android 8.0 / API 26 or later, one user and one device. Target SDK and distribution route remain undecided. Use a calm pastel-blue visual direction, readable text, accessible contrast, labelled controls, and screen-reader support. Do not introduce guilt mechanics, streak penalties, red overdue counters, or shaming copy.

Primary navigation: Home, Inbox, Projects, Review, and Settings. Quick capture is prominent on Home. All task decisions should be reachable without navigating through a Project.

## 3. Core journeys

1. **Set a rhythm:** choose Friday, Saturday, or Sunday for weekly review; enter usual working hours. Explain notification permissions in context. Notification Listener is optional and disabled initially.
2. **Describe:** type, dictate, or share a message. Extract separate actions and retain the complete original text on each proposal. Manual Inbox capture remains an alternative.
3. **Review the proposed plan:** infer category, priority, date/time, duration, and focus. Keep explicit times; choose conflict-free working-time slots for urgent flexible actions. Show estimates and uncertainty. The user edits any suggestion, then selects Confirm & save plan. Closing or discarding the proposal saves no new tasks. Unresolved details remain unscheduled. A scheduled task requires valid start, duration, and energy, which the planner may estimate for user review.
4. **Act or reconsider:** complete a scheduled task, select another slot with a logged reason, or move it to another category. A passed slot cannot remain silently forgotten.
5. **Review:** work through Important tasks by Project, using reschedule and snooze history as context. Promote, keep, move to Someday, or delete; pause and resume without losing decisions.
6. **Protect data:** export everything to JSON or export task rows to CSV. Explain the absence of automatic backup.

## 4. Functional requirements and acceptance

| ID | Requirement | Acceptance condition |
| --- | --- | --- |
| FR-01 | Onboarding | Weekend day and working hours are required; permission explanations precede requests. Declining Notification Listener leaves other features usable. |
| FR-02 | Intelligent capture | Extract separate actions from one message, propose categories and scheduling without requiring manual classification, and preserve an alternative manual Inbox path. Core capture remains fast; model latency must be measured separately. |
| FR-03 | Optional context | Offer original-message retention on extracted tasks and custom notes on manual tasks. Preserve opted-in context across splitting, editing and export; allow users to edit/remove it explicitly. If declined, store no original-message context with the new tasks. Declining local retention does not prevent a consented AI request from processing the selected message. |
| FR-04 | Readiness and confirmation | Valid start, duration, and energy are required for Schedule now. Planner estimates are visible and editable. No proposal is committed until the user confirms. Prerequisite notes remain optional. |
| FR-05 | Task operations | Create, edit, complete, soft-delete, recategorise, and associate one Project and one Meeting. Store state-change timestamps. |
| FR-06 | Missed plans | A scheduled slot that passes without completion appears on next opening or in the evening summary and requires rescheduling or reprioritisation. |
| FR-07 | Projects | Create, edit, archive, set context (Work/Family/Personal), optional description and target date, and view linked tasks and meetings. Show completed/total progress. Archive/delete semantics require a decision. |
| FR-08 | Meetings | Store title, date/time, notes, free-text participants, and optional Project. A task linked to a Meeting inherits its Project when present. Independent Meetings are allowed. |
| FR-09 | Home | Show today's scheduled tasks, Inbox count, items needing attention, next meeting or scheduled item, and quick capture. Show a reassuring cleared-Inbox state. |
| FR-10 | Calendar | Create a device calendar event using task start/duration and retain its event ID for updates. Calendar selection and deleted-event behavior remain open. |
| FR-11 | Weekly review | Use chosen weekend day; show Important tasks by Project and relevant history. First three reviews are unlimited; subsequent reviews contain at most 20 tasks. Support pause/resume and a session of at most 15 minutes. Ordering is unresolved. |
| FR-12 | Someday review | Offer a grouped batch about every six months. Promote to Important, keep, delete, and postpone part of a batch. Exact interval and configurability remain open. |
| FR-13 | Export | JSON includes all Task, Project, Meeting, settings, and history records. CSV contains tasks. Export works offline. Import is excluded. |
| FR-14 | Energy guidance | Explain how to protect energy for demanding tasks. Per-task High/Medium/Low focus is assumed by the BRD and must be confirmed before production. |
| FR-15 | Automatic planning | Extract every independent action, including multiple jobs in one sentence or list, into separate task proposals in message order. Each has its own type, priority, date/time, duration and focus; copy original context to each only when enabled. Interpret today/tomorrow/weekdays relative to local time. Keep fixed commitments at stated times and check conflicts. Schedule urgent flexible work within free working time outside quiet hours. No slot means an unscheduled Important task, not silent overbooking. |
| FR-16 | Uncertainty and correction | Flag missing AM/PM, midnight/noon ambiguity, past dates, conflicts, unsupported phrases, and deadlines confused with start times. Allow edits to individual proposals and explicit batch confirmation. Never automatically send invitations or treat a draft as a saved event. |
| FR-17 | Manual and AI creation | Show two prominent slots: Manual and AI. Manual exposes title, task type, priority, date, time, duration, focus, context, and optional Project/Meeting connections; the user enters the details. AI fills the same relevant details from a message and shows them for editing and confirmation. Require date/time for Schedule now; do not invent dates for Important or Someday. Switching modes preserves entered form data. No prototype/live switch, provider logo, model controls, or repeated setup questions. Keep context retention in Settings. |

### Example of the revised experience

Message: “Sir today we have a meeting at 12:00 am and we need to go to the office at 3 pm and Sunday Mr Shafiq will come at 6pm.”

The app proposes three actions. It proposes 3 PM for the office visit and 6 PM on the displayed Sunday date for Mr Shafiq's visit. It flags 12 AM as midnight and asks for confirmation or correction to noon; past times and conflicts also require checking. The user may edit titles, dates, duration, category, or focus. Selecting Confirm & save plan saves the approved proposal; unresolved actions stay unscheduled. No manual message splitting is required.

## 4a. AI integration design

For production-quality understanding of varied messages, evaluate Gemini with schema-constrained JSON output. Supply the message, local date/time, IANA time zone, preferences, and only necessary schedule context. Return actions, dates, people, category/priority suggestions, estimated duration/focus, explanations, and clarification questions. Treat returned text as untrusted input: validate schema, allowed categories, dates, duration, conflicts, and identifiers in application code. The model extracts intent; deterministic application code enforces scheduling constraints.

Use a backend endpoint to hold the provider credential, apply rate/size limits, and validate responses. Never embed a Gemini key in React or an Android bundle. Provide transparent opt-in for sending selected messages, choose suitable provider data terms, and retain manual/local capture when the network or model is unavailable. Do not upload the full local database. The prototype includes a loopback-only Node backend configured with `.env.local`; it makes provider requests only when the key is configured and the user requests connected AI. It sends message and local time context, then checks scheduling against local data in the browser. See `docs/AI_SETUP.md`.

Gemini supports [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output). See Google's [API-key guidance](https://ai.google.dev/gemini-api/docs/api-key) and [data-use terms](https://ai.google.dev/gemini-api/terms). The demo adapter uses Gemini, but production model evaluation, budget, retention policy and multilingual testing remain decisions. Live behavior is unverified until a user-owned key is configured; automated tests mock the provider.

## 5. Reminder behavior

| Trigger | Required experience |
| --- | --- |
| Schedule now | Prompt at slot start; offer calendar creation on the day a task is scheduled. |
| Inbox not empty | At least three reminders during the day until cleared. Skipping requires deliberate confirmation and a selected return time. |
| Dismissal or snooze | Return later that day and include the item in the evening summary. Snooze requires a short stored reason. |
| Weekly review | Notify on selected weekend day. Offer a skipped session again the next day and in the evening summary. |
| Someday collection | Notify for the six-month batch review. |
| Evening | Summarise completed work, waiting thoughts, and plans needing another time. |

Notifications use a quiet channel and action buttons for Done, Reschedule, Snooze with reason, and Move category. Respect quiet hours for all reminders and working hours for work-related reminders, with special-day overrides. The default escalation sequence is reminder, second reminder, third reminder, evening summary, then review; its upper limit remains open. Quiet hours and compressed working windows must be reconciled with reminder-frequency requirements before release.

Android dismissal cannot be prevented. Design for return and in-app reconciliation, not an uncloseable notification. Production implementation must handle permission denial, exact-alarm constraints, Doze, manufacturer battery controls, and alarm restoration after reboot. Review current platform and store requirements when choosing the target SDK; these are release engineering tasks, not validated by this prototype.

## 6. Data and privacy

Production records use UUIDs, creation/update timestamps, and soft-delete flags. Retain relationships without hard-coding assumptions that prevent later accounts or sync, while avoiding implementation of those features in V1.

| Entity | Minimum data |
| --- | --- |
| Task | Title, state, original text, capture source/app, optional Project/Meeting, completion timestamp, state-change history. |
| Scheduled task fields | Start, duration, energy, optional prerequisite note, optional calendar event ID. |
| Project | Name, optional description/target date, context, Active/Archived status. |
| Meeting | Title, date/time, notes, participants, optional Project. |
| Reschedule/snooze | Task ID, prior/new slot where relevant, reason, timestamp. |
| Settings/review | Weekend day, usual/special-day working hours, quiet hours, permissions, review session/progress. |

Use a local database for production and keep manual capture, saved-task management, reviews, and exports available in airplane mode. A hosted intelligent planner requires connectivity; disclose this exception and offer manual capture on failure. Do not add telemetry or cloud analytics. Notification Listener must provide app selection, a clear privacy explanation, and an easy off switch. Persist content only when a user accepts its suggestion. Remind users periodically to export; manual export is their only V1 backup.

Time-zone and daylight-saving changes must not unexpectedly shift reminders. The time-zone storage and reconciliation strategy needs engineering definition and device tests.

## 7. Success and release criteria

Measure locally: same-day Inbox clearing, reviews finished within 15 minutes, and the proportion of scheduled tasks completed or consciously rescheduled. Numeric adoption targets are not defined in the BRD. These proxies do not prove anxiety reduction; qualitative research remains an open product decision.

Release requires all section 9 BRD acceptance behaviors on at least three device brands, including capture speed, preserved split context, readiness rejection, missed-task surfacing, reminder frequency, review limits, calendar event correctness, offline export completeness, and calm-copy review. Exercise reboot, Doze, denied permissions, quiet hours, time-zone changes, and manufacturer battery restrictions. Include accessibility checks with a screen reader and large text. No coverage percentage is specified.

## 8. Open decisions

| BRD item | Decision needed | Impact |
| --- | --- | --- |
| 1 | Repeated-reschedule threshold and action | History/counter behavior; resolve before dependent production work. |
| 2 | Maximum escalation | Reminder safety and tone. |
| 3 | Which 20 Important tasks enter capped reviews | Review selection and ordering; resolve before production. |
| 4 | Project archive versus delete; linked-task handling | Data integrity and Project lifecycle. |
| 5 | Calendar selection and deleted events | Calendar synchronization behavior. |
| 6 | Exact Someday interval and configurability | Review scheduling. |
| 7 | Target Android SDK and distribution | Permissions, store compliance, release plan. |
| 8 | App and voice languages | Localization, speech recognition, typography. |
| 9 | Qualitative validation of anxiety relief | Research plan. |
| 10 | Notification suggestions and allowed apps | Privacy and integration scope. |
| 11 | Per-task energy label versus guidance alone | Readiness gate and model; resolve before production. |

Product owner approval is needed for these decisions. For demonstration only, the prototype uses per-task energy and oldest-first review selection grouped by Project. It implements no repeated-reschedule nudge or Project deletion/archive policy.

## 9. Prototype coverage and implementation plan

The React/Vite prototype provides distinct Manual and AI creation slots. Manual exposes the full task form; connected AI prepares the same relevant fields from a message through the local backend. Proposals show task type, priority, date, time, duration, focus and retained context before explicit confirmation. Both paths share task editing and readiness validation. It also supports splitting, completion/reopening, soft deletion, reschedule history, missed-plan filtering, Project creation/detail/progress, Meeting creation/detail/linking, weekly review, manual Someday review, in-app summary, preferences, and JSON/CSV download. Priority is retained in state transitions and exports. Confirmed task data remains in browser local storage; no account is required. The local English parser remains tested source code but is not exposed as a separate creation mode.

The optional connected-AI path calls Gemini through the local backend after user consent. No key is included. The alternative local rules cover common English messages, not unrestricted grammar, Bangla, or reliable importance understanding. Every proposal must be reviewed. The prototype does not implement native Android alarms, notification actions/listening, speech recognition, share intents, calendar events, production SQLite persistence, installable APKs, cached cold-start offline loading, scheduled reviews, archive/edit flows for Projects and Meetings, or a dedicated onboarding wizard. Weekly timer and Someday batching are demonstrations, not production acceptance. Settings expose onboarding preferences. Browser data can be lost when storage is cleared; use exports. Different localhost ports have separate browser storage; existing data on port 5173 is not automatically migrated to port 3001.

1. **Validate experience:** walk through message → proposed plan → edit → confirm → complete. Verify cancellation leaves saved tasks unchanged, midnight/noon ambiguity is visible, and conflicts are explained. Evaluate mixed messages, Bangla/English, people names, dates, and ambiguous requests before selecting an AI provider.
2. **Settle decisions:** close model/review blockers (1, 3, 11), then privacy, calendar, language, and release choices.
3. **Build Android foundation:** local database, accessible screens, lifecycle rules, export, and onboarding.
4. **Integrate device behavior:** capture intents, speech, calendar, reminders, permissions, and reboot restoration.
5. **Verify release:** full acceptance on three brands and offline/data-loss checks before distribution.
