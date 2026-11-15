# Ship a secure hosted AI backend for the client demo

Priority: High · Branch: `feature/hosted-ai-backend`

## User experience and benefit

A user sends “Call Alex tomorrow at 10am, send the proposal at 2pm and buy groceries at 6pm,” reviews three tasks and saves. They should not need a local server or enter a key. Real AI understanding would extend the Pages demo's labelled local English preview.

## Acceptance

- Deploy an HTTPS backend with provider keys in server secrets.
- Add authenticated/scoped demo access, per-user quotas and spending controls before public exposure.
- Restrict the allowed frontend origin; validate message sizes and structured responses.
- Connect through a non-secret frontend endpoint URL; preserve confirmation and optional context.
- Verify real-provider extraction, failures and rollback. Remove the local-preview label only after live verification.
