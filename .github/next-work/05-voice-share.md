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
