# Sorted Android app (issues #2, #7, #5)

Expo + TypeScript. Feature folders under `src/features/`. Domain rules in `src/domain/` match [postman/specs/sorted-data-contract.yaml](../postman/specs/sorted-data-contract.yaml).

```
src/
  shell/         navigation, AppProvider (reload on resume)
  data/          SQLite + schemaVersion migrations (never DROP tasks)
  domain/        Task lifecycle, capture titles, export JSON/CSV
  features/      onboarding, capture (type/voice/share), home, inbox, projects, review, settings
  ui/            theme
```

Typed, voice, and shared text land in Inbox. Original text and source stay on the task. Core capture and export work without a network. Voice and share need a native build (`npx expo run:android`); Expo web is preview only.

```powershell
npm test
npx expo start
```
