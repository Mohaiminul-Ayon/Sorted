# Sorted Android app (issue #2)

Expo + TypeScript. Feature folders under `src/features/`. Domain rules in `src/domain/` match [postman/specs/sorted-data-contract.yaml](../postman/specs/sorted-data-contract.yaml).

```
src/
  app/           navigation, AppProvider
  data/          SQLite schema and repositories
  domain/        Task lifecycle, export JSON/CSV
  features/      onboarding, capture, home, inbox, projects, review, settings
  ui/            theme
```

```powershell
npm test
npx expo start
```
