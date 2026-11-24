# Repository Guidelines

## Project scope

**Sorted V1** is a single-user, offline **Android task-management app** (minimum API 26). Production delivery is a **React Native** installable app, not a website.

Authoritative product requirements: [docs/PRD.md](docs/PRD.md) and `Sorted — Business Requirements Document v1.3.docx`.

## Project structure

| Path | Role |
| --- | --- |
| `Sorted — Business Requirements Document v1.3.docx` | Client BRD reference |
| `docs/PRD.md` | Consolidated requirements (client V1 + labeled AI extras) |
| `src/` | **Frozen** Vite UX reference — **no active development**; port ideas into the React Native app |
| `server/` | Optional loopback Gemini backend for prototype AI demos |
| `.github/next-work/` | Planned native Android work (reminders, calendar, foundation, etc.) |
| `docs/AI_SETUP.md` | Local prototype AI configuration |

When the React Native app scaffold is added, document its module layout, build, and test commands in this file. Do not treat `src/` browser storage or GitHub Pages as the shipped product.

## Build, test, and development (prototype)

Requires Node.js 22.12+ (CI uses Node 24).

```powershell
npm ci
npm test
npm run build
npm start
```

- `npm start` — frontend + loopback server at `http://127.0.0.1:3001`
- `npm run dev` — Vite dev server only
- Provider keys belong in root `.env.local` (see `.env.example`); never commit keys or embed them in the client bundle

Android app build commands will be added when the React Native project exists.

## Coding style and naming

Use BRD entity names consistently: **Task**, **Project**, **Meeting**. Preserve original capture text, UUIDs, timestamps, state history, and soft-delete behavior in any implementation.

Match conventions of the React Native scaffold once added. Keep Markdown concise; put paths and commands in backticks.

## Testing guidelines

- **Prototype:** `npm test` runs Node tests for `src/model.js`, `src/organize.js`, `server/ai.test.js`
- **Production V1:** use BRD section 9 and [docs/PRD.md](docs/PRD.md) section 11 as the acceptance checklist
- Required before release: readiness validation, missed-task handling, review limits, offline operation, complete exports, **native reminders after reboot and Doze on at least three device brands** (record devices and results)

## Commit and pull request guidelines

Use concise, imperative subjects (e.g. `docs: align PRD with client Android V1`).

Pull requests should reference requirements (FR/EX IDs or BRD section), report validation results, include screenshots for UI changes, and flag unresolved open decisions instead of silently choosing product behavior.

## Product scope and privacy

V1 stays local and offline for core features. No accounts, cloud task sync, or telemetry. Notification Listener is optional and **off by default**; persist notification content only after the user accepts a suggestion. Do not commit real personal task data or API keys. Resolve BRD open items that block dependent behavior (see PRD section 8) before implementing those features in production.