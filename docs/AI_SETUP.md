# Connected AI demo setup

Sorted offers two visible creation slots: **Manual** and **AI**. Manual displays the full task form and requires no API. AI fills the relevant fields from a message, and proposals remain editable and unsaved until **Save tasks**. No provider logo, prototype/live switch, or setup questions appear in task creation.

## 1. Get a key

Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Choose a project and model available to your account. Review quota/billing and [provider data terms](https://ai.google.dev/gemini-api/terms) before using real personal or client messages. Use fictional examples for demonstrations.

## 2. Put the key on the backend

Open `.env.local` in the repository root, next to `package.json`:

```dotenv
GEMINI_API_KEY=replace_with_your_actual_key
GEMINI_MODEL=gemini-3.8-flash
```

The model name is configurable because availability changes. It must be available to your key and support `generateContent` with structured JSON output. The supplied default follows the current [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash). If Google rejects the model, select an available text model from your AI Studio project and update this variable.

`.env.local` is ignored by Git and read only by the Node backend. A nonempty key/model in that file takes precedence over inherited server variables. Do not put the key in `src/`, `index.html`, browser storage, a frontend settings form, a `VITE_` variable, or chat. Vite exposes variables prefixed `VITE_` to the browser. See Google's [key-security guidance](https://ai.google.dev/gemini-api/docs/api-key).

## 3. Start the demo

Use Node.js 22.12+; Node 24 is supported.

```powershell
npm install
npm run build
npm start
```

Open **http://127.0.0.1:3001**. This server serves the built React app and the protected AI endpoint together. Vite's development/preview URL on port 5173 does not provide the AI endpoint. Restart `npm start` after changing `.env.local`; rebuild after changing frontend code.

## 4. Try both modes

- **Manual:** enter a title and task type, choose priority, and fill the visible date/time, duration, focus and context fields as relevant. Date/time are required for Schedule now. Project and Meeting are optional. Select Create task.
- **AI:** paste a message and select Fill tasks with AI. Review the populated task type, priority, date, time, duration, focus and context; edit if needed and select Save tasks. A short explanation makes AI processing clear without repeated permission checkboxes.
- **Context:** Settings controls whether new AI tasks keep the original message. Manual tasks have optional notes. Context can be edited or removed in task details and is included in exports. Turning off local retention does not stop the requested AI analysis from processing the message.
- **No key or service unavailable:** use manual entry. Capture does not expose model settings, demo switches, connection diagnostics, or API instructions.

## How the connection works

```text
React -> POST /api/plan -> local Node backend -> Gemini
      <- validated suggestions <-
local conflict checks -> editable proposal -> confirmation -> local storage
```

Only the selected message, local date/time and time-zone context are sent. Existing task titles, Project descriptions and the full local database are not uploaded. The browser checks availability against its local schedule. Keys stay on the server; the status endpoint returns only a configured/not-configured flag. The request uses the one-shot `generateContent` endpoint with structured JSON output and a 30-second timeout. The app creates no hosted conversation history; provider data-processing and retention terms still apply. No messages or model replies are logged by this server.

Each independent job in a message becomes a separate proposal. For example, “Call Alex tomorrow at 10am, send the proposal at 2pm and buy groceries at 6pm” should show three cards, each with its own type, date, time, duration, priority and focus. When context retention is enabled, each keeps the original message. Review the cards before saving.

The API reports distinguishable error codes: `AI_NETWORK`, `AI_TIMEOUT`, `AI_HTTP_401/403` (key/access), `AI_HTTP_404` (model), `AI_HTTP_429` (quota), and `AI_RESPONSE` (invalid/incomplete output). The screen shows the safe error explanation instead of hiding every failure behind a generic message.

## Limits

If an agent-managed terminal blocks outbound requests with `EACCES`, the key may be loaded correctly but Google has not been reached. Run `npm start` in your own normal terminal to test the connection. This is different from a provider rejection of the key or model.

The server binds to loopback, limits AI requests to ten per minute and one concurrent request, and rejects foreign browser origins. This is a local demonstration server. Before public deployment, add authentication and per-user quotas, production secret storage, HTTPS, and appropriate hosting. The app does not send invitations or Android reminders. Test the real provider connection after adding your own key; automated tests mock it and do not spend API quota.
