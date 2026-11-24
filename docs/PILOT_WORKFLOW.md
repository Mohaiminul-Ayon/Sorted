# Sorted pilot workflow (PR-by-PR)

Production target: **React Native Android** per [PRD.md](PRD.md) v2.0.

**Active work:** client **pilot issues only** (#2–#12 per table below). Do **not** open PRs for `feature/manual-task-creation`, GitHub Pages, or other prototype branches unless the owner explicitly restarts the web demo.

The Vite app in `src/` is **frozen reference** (copy/logic hints). It is not the delivery vehicle.

## How we ship

1. Open or pick the **GitHub issue** for the feature.
2. Check out the matching **`feature/...` branch** (listed in [.github/features.json](../.github/features.json)).
3. Implement acceptance criteria from the issue and `.github/next-work/*.md` where linked.
4. Open a **pull request** into `main`; title format: `feat(area): short description (#issue)`.
5. Merge only when tests/checks pass and acceptance is described in the PR body.
6. Take the **next issue in pilot order**—do not stack unrelated features in one PR.

## Pilot phase (native app delivery)

Work **in this order** until the pilot milestone is complete. Issue numbers refer to [Mohaiminul-Ayon/Sorted issues](https://github.com/Mohaiminul-Ayon/Sorted/issues).

| Order | Issue | Branch | Deliverable |
| --- | --- | --- | --- |
| 0 | — | `chore/pilot-prd-and-github-workflow` | PRD v2, AGENTS.md, this workflow |
| 1 | #2 | `feature/android-foundation` | RN scaffold, SQLite, onboarding, Inbox capture, export |
| 2 | #7 | `feature/offline-loading` | Cold start, offline reads/writes, upgrade safety |
| 3 | #5 | `feature/voice-and-share` | Share intent + speech → Inbox |
| 4 | #3 | `feature/android-reminders` | Native notifications, actions, reboot/Doze |
| 5 | #4 | `feature/device-calendar` | Calendar events + stored event IDs |
| 6 | #8 | `feature/project-meeting-management` | Edit/archive rules (after owner decisions) |
| 7 | #9 | `feature/review-sessions` | Weekly + Someday timed sessions |
| 8 | #10 | `feature/device-acceptance` | Three brands, a11y, calm-copy checklist |
| 9 | #12 | `feature/export-hardening` | Complete JSON/CSV copies |
| 10 | #1 | `feature/hosted-ai-backend` | Optional AI (last; needs network) |
| — | #6 | `feature/notification-suggestions` | Optional; after core pilot |
| — | #11 | `feature/multilingual-dates` | After languages decided (BRD #8) |

**Pilot complete when:** orders 1–8 pass acceptance on three devices and export matches PRD section 11.

**Final product = pilot complete + owner sign-off** on BRD open items. Prototype/demo work is out of scope for the current plan.

## Client open decisions (blockers)

Before production release, close PRD section 8 items **3, 4, 5, 7, 11** with the product owner. Track decisions in issue comments; do not guess in code.