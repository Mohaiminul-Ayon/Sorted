# Add voice capture and Android share-to-Sorted

Priority: Medium · Branch: `feature/voice-and-share`

## User experience and benefit

A user dictates “Call the supplier tomorrow” or shares a three-job message to Sorted. The same editable proposal flow avoids retyping the request.

## Acceptance

- Integrate device speech recognition and Android text share intents.
- Confirm supported voice/app languages.
- Preserve source and opted-in original context on each task.
- Request microphone access only when invoked; handle cancellation and unavailable recognition.
- Measure capture speed and verify multi-action completeness.

## Implementation (code-complete)

- Device speech: `expo-speech-recognition`. Microphone permission is requested only when Speak is tapped. Cancel calls `abort()`. Missing recognizer / denied mic / no-speech show a calm message.
- Locale: `getSupportedLocales` plus the device language, falling back to English. Settings lists supported/offline locales when the native module can answer.
- Android share: `expo-share-intent` with scheme `sorted` and `text/*`. Shared body is an editable proposal; each non-empty line becomes an Inbox task; every task keeps the full original text and source app when present.
- Web preview does not receive Android share intents.

Device checks still needed: speak into Inbox on three OEM builds, share from Messages/Gmail, and time capture from app-open to saved Inbox item.
