# Sorted Android app (issue #2)

Expo + TypeScript. Feature folders under `src/features/`. Domain rules in `src/domain/` match [postman/specs/sorted-data-contract.yaml](../postman/specs/sorted-data-contract.yaml).

```
src/
  app/           navigation, AppProvider (reload on resume)
  data/          SQLite + schemaVersion migrations (never DROP tasks)
  domain/        Task lifecycle, export JSON/CSV, offline copy
  features/      onboarding, capture, home, inbox, projects, review, settings
  ui/            theme
```

Core capture and export work without a network. AI (later) shows a calm “Inbox still works” message when offline.

```powershell
npm test
npx expo start
```
