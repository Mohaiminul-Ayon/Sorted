# Sorted Android app

Expo + TypeScript. Feature folders under `src/features/`. Domain rules in `src/domain/` match [postman/specs/sorted-data-contract.yaml](../postman/specs/sorted-data-contract.yaml).

Typed, voice, and shared text land in Inbox. Reminders, calendar, projects, meetings, reviews, and export are local. Native reminders and share/voice need `npx expo run:android` (or EAS), not Expo Go. Device matrix: [docs/DEVICE_ACCEPTANCE.md](../docs/DEVICE_ACCEPTANCE.md).

```powershell
npm test
npx expo start
```
