# Publish Sorted to GitHub

Target repository: https://github.com/Mohaiminul-Ayon/Sorted

## Prepared deliverables

- User-focused README with examples and benefits for each feature.
- A Pages workflow that runs tests and builds the `/Sorted/` client demo.
- 29 named feature-area branches in `.github/features.json`.
- 12 next-work issue descriptions with examples, benefits and acceptance criteria.
- An idempotent publishing helper: existing branches/issues are preserved and history is never force-pushed.

The agent environment blocks GitHub network access and writes to Git's index/config, so it could not create a commit, branches, remote issues or deployment. The expected URL is `https://mohaiminul-ayon.github.io/Sorted/`; treat it as live only after a successful Pages run and HTTP check.

## Complete publication from a connected terminal

Use the repository owner's normal terminal in this project directory. Git and GitHub CLI must be installed, and the account needs repository write access plus Pages administration.

```powershell
gh auth login -h github.com
npm ci
npm test
npm run publish:github
```

The helper checks planned source files for private environment files and credential patterns; stages and commits the prepared project; fetches and merges existing remote history; creates/pushes main and missing feature branches; creates missing issues; enables Pages; runs deployment; and prints the actual URL only after successful verification. It does not upload `.env.local`, `node_modules` or `dist` to the source repository.

If a remote README/history conflicts with local files, resolve and commit the merge, then rerun the helper. No force push is used. If Pages administration is unavailable, the script stops after any already-successful pushes/issues; rerunning skips those existing resources.

```powershell
npm run publish:check # Local plan, issue-file and tracked-secret checks only
```

## What the client link demonstrates

GitHub Pages serves the frontend. Manual tasks, reviews, Projects, Meetings, exports and persistence run in the browser. The message-planning screen uses the labelled local English preview, including separate tasks for multiple jobs. It never uploads a Gemini key or pretends to be a live Gemini response.

Real Gemini access needs the protected backend described in issue `01-hosted-ai.md` and `AI_SETUP.md`. Keep provider secrets in backend-only configuration, never GitHub Pages build variables. Build flag `VITE_PAGES_DEMO` is non-secret and selects the hosted preview automatically without a user-facing prototype/live choice.

## Branch and issue policy

Feature branches begin at the reviewed application baseline and are available for focused future work. Branches do not represent separate historical implementations. The helper preserves existing remote branches and matches issue titles to avoid duplicates. A closed matching issue is not silently reopened.

Keep `.env.local` local. For the client demo, use fictional data and export anything you want to retain before clearing browser storage.
