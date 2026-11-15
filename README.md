# Sorted

**Turn scattered messages into a plan you can review—or create every task yourself.**

Sorted helps professionals manage work and personal commitments without holding everything in their heads. It separates things ready to do from things needing thought and ideas for later, with calm language and an explicit save step for generated proposals.

**Repository:** [Mohaiminul-Ayon/Sorted](https://github.com/Mohaiminul-Ayon/Sorted)  
**GitHub Pages deployment target:** [mohaiminul-ayon.github.io/Sorted/](https://mohaiminul-ayon.github.io/Sorted/) — available after the Pages workflow succeeds; initial publication is not yet verified.

## What you can demonstrate

The React app supports manual task creation, message-to-task proposals, editing, scheduling checks, Projects, Meetings, reviews, local persistence and exports.

The GitHub Pages build runs a **local English message-planning preview**, labelled in the message form. GitHub Pages serves static files and cannot run the Node/Gemini backend. The hosted preview does not call Gemini or upload messages. Live Gemini is a separate backend integration whose provider access still needs verification. Task creation has no provider logo or prototype/live selector.

## Manual: enter the details yourself

Open **What's on your mind? → Manual**. Enter a title, select a task type and priority, and fill in date, time, duration, focus and context as relevant. You can link a Project or Meeting. Schedule now requires a date, time, positive duration and focus. Other categories can remain unscheduled.

**Example:** “Prepare the client proposal” → Schedule now → tomorrow at 10 AM → 45 minutes → High priority → High focus. Add “Include the cost breakdown requested by the client” as context, then select Create task.

**Why use it:** you have a clear plan and want precise control. Switching between Manual and AI preserves unsaved inputs in the open creation dialog.

## AI: start with a message and review the details

Open **What's on your mind? → AI**, enter your message, and select Fill tasks with AI. Review the cards, choose Edit for corrections, then Save tasks. Nothing enters your saved plan before confirmation.

**Example:** “Call Alex tomorrow at 10am, send the proposal at 2pm and buy groceries at 6pm.”

| Separate task | Suggested date | Suggested time |
| --- | --- | --- |
| Call Alex | Tomorrow | 10 AM |
| Send the proposal | Tomorrow | 2 PM |
| Buy groceries | Tomorrow | 6 PM |

Each card has its own type, priority, duration and focus. If context retention is enabled, each keeps the original message. Unclear or conflicting times are flagged for review.

**Why use it:** avoid copying and organising every commitment manually. The Pages preview handles common English patterns; the configured Gemini backend is intended for broader language understanding. Review suggestions before saving.

## Feature guide: how, examples and benefits

| Feature | How to use it and an example | Why it helps |
| --- | --- | --- |
| Inbox | Capture “Check the supplier options,” then open it later and choose a category. | Collect thoughts without making every decision immediately. |
| Schedule now | Give “Send the estimate” a date, time, duration and focus level. | Turn an intention into a concrete plan. |
| Important | Keep “Plan next quarter's launch” here until its next step is clearer. | Preserve valuable work needing thought. |
| Someday | Put “Learn pottery” here without an immediate date. | Keep possibilities outside today's plan. |
| Priority and focus | Give a client deadline High priority and proposal writing High focus. | Separate importance from the energy needed. |
| Multiple tasks per message | Send “Call Alex… send the proposal… buy groceries…” and review three cards. | Keep independent jobs from disappearing inside one task. |
| Availability checks | Request urgent work without a time; the planner looks for a free working slot outside quiet hours. | Reduce overbooking. Explicit commitments are checked for overlaps. |
| Clarification | Enter “Meeting at 12 AM” and check whether midnight or noon was intended. | Make uncertainty visible before saving. |
| Context | Add instructions manually or enable original-message retention in Settings. Edit/remove context from task details. | Remember why an action exists and what was requested. |
| Editing | Open “Send proposal,” change its time, priority or notes, then save. | Adjust the plan when circumstances change. |
| Splitting | Open an Inbox task, select Split into smaller tasks, and enter one action per line. | Break a large request into manageable steps while keeping context. |
| Completion/reopening | Use the circular check. Under Done, select Reopen if more work is needed. | Track progress without making completion irreversible. |
| Letting tasks go | Confirm removal in task details; the record remains soft-deleted in JSON exports. | Remove unnecessary commitments while retaining a record. |
| Home dashboard | See category counts, today's plan, a meeting preview and attention items. | Understand the plan at a glance. |
| Needs attention | Revisit a passed scheduled slot and choose another time/category. | Keep missed plans visible. This is in-app checking, not background notification delivery. |
| Reschedule history | Change a slot and optionally explain “Client moved the discussion.” Inspect history later. | Preserve why plans changed. |
| Projects | Create “Website refresh,” link tasks, and inspect completed/total progress. | Connect everyday steps to a larger outcome. |
| Meetings | Create “Client kickoff” with time, participants and notes; link follow-up tasks. | Keep conversations and their resulting actions together. Meetings may stand alone or link to a Project. |
| Weekly review | Decide whether Important tasks should be scheduled, kept, moved to Someday or deleted. Pause and return later. | Make regular decisions. First three sessions are unlimited; later sessions select at most 20 items. |
| Someday review | Open the collection and promote “Try pottery” when it becomes relevant. | Revisit possibilities without making them immediate obligations. Automatic six-month prompts are future work. |
| Summary | Open “A quiet look at today” for completed, Inbox and attention counts. | Get an in-app snapshot; this is not yet a complete daily analytics report. |
| Your rhythm | Set weekend day, working hours and quiet hours in Settings. | Fit flexible planning around your life. |
| Context preference | Choose whether new AI tasks retain the original message. Existing context changes only when explicitly edited. | Control retained background information. |
| Local persistence | Return to the same browser and origin to continue with saved tasks. | Keep your plan between visits without an account. |
| JSON export | Settings → Export all data; store the downloaded file safely. | Keep tasks, Projects, Meetings, settings, history and soft-deleted records. |
| CSV export | Settings → Export tasks; open the active task rows in a spreadsheet. | Review/share titles, categories, priority, context and scheduling fields. |
| Mobile layout | Open on a phone or use a narrow browser window. | Explore bottom navigation and task dialogs in the intended mobile layout. |

## A five-minute client walkthrough

1. **Problem:** “A single message can contain several commitments. Sorted gives each one its own place.”
2. **Manual:** create a High-priority client proposal with a time and context.
3. **Message planning:** use the three-action example, inspect the fields, and edit one suggestion before saving.
4. **Organisation:** complete a task, inspect Project progress, and explain Important versus Someday.
5. **Control:** show retained context, review decisions and export. Explain the delivery boundaries below.

Use fictional data and rehearse the flow before presenting. Demonstrate live Gemini through a verified backend rather than describing the Pages planning preview as a live model response.

## Run locally

Requires Node.js 22.12+; CI uses Node 24.

```powershell
npm ci
npm test
npm run build
npm start
```

Open **http://127.0.0.1:3001** for the frontend and backend. Put your key in the ignored root `.env.local`, using `.env.example` as the template. Never put it in React, a `VITE_` variable, Git or browser storage. See [AI setup](docs/AI_SETUP.md).

```powershell
npm run dev      # Frontend development; connected AI requires the backend
npm run preview  # Preview the static build
```

Restricted environments may block Vite's optimiser or outbound AI traffic. Test the live provider from a terminal with appropriate network access.

## Publishing and planned work

The [Pages workflow](.github/workflows/pages.yml) tests and builds the `/Sorted/` static demo on main. Enable GitHub Actions as the Pages source. It receives no Gemini secret. See [publishing instructions](docs/PUBLISHING.md).

Feature-area branches are listed in [.github/features.json](.github/features.json). They start at the same baseline; their names do not imply unfinished features are implemented. Next-work issues and acceptance criteria live under [.github/next-work](.github/next-work).

## Current boundaries

- React browser prototype; Android APK delivery remains planned.
- Native reminders, calendar events, voice capture, Android sharing, notification listening and reboot handling are not connected.
- Project/Meeting editing and archive behavior, richer Someday batches, accessibility/device acceptance and cold-start offline loading remain planned.
- No cloud task sync, automatic backup, accounts or telemetry. Clearing browser storage removes the plan; export first. Localhost ports and the Pages domain have separate storage.
- Browser walkthrough and live Gemini success remain unverified in this restricted environment. Automated AI tests mock the provider.

## Repository map

- `src/main.jsx`: screens, capture modes, dialogs and local persistence.
- `src/TaskForm.jsx`: shared full task form.
- `src/model.js`: lifecycle, reviews, exports and fictional demo data.
- `src/organize.js`: local planning preview and AI scheduling checks.
- `src/ai-contract.js`: proposal validation.
- `server/`: Gemini backend and mocked API tests.
- `docs/PRD.md`: requirements and acceptance criteria.
- `.github/`: Pages workflow, feature branches and next-work descriptions.

Tests use Node's built-in runner. See [Vite deployment guidance](https://vite.dev/guide/static-deploy) for GitHub Pages base-path configuration.
