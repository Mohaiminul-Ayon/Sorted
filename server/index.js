import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { parseEnv } from 'node:util';
import { requestPlan } from './ai.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = 3001;
const localConfig = parseEnv(await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; }));
const apiKey = localConfig.GEMINI_API_KEY?.trim() || process.env.GEMINI_API_KEY;
const model = localConfig.GEMINI_MODEL?.trim() || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
const allowedOrigins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);
let windowStart = Date.now(), requests = 0, busy = false;

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

// shortcut: loopback-only demo server, add authenticated hosting before exposing the AI endpoint publicly.
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!allowedHosts.has(req.headers.host) || (req.headers.origin && !allowedOrigins.has(req.headers.origin))) return json(res, 403, { error: 'Use the local Sorted URL.' });
  const path = new URL(req.url, `http://127.0.0.1:${port}`).pathname;
  if (path === '/api/status' && req.method === 'GET') return json(res, 200, { configured: Boolean(apiKey), provider: 'ai' });
  if (path === '/api/plan' && req.method === 'POST') {
    if (!apiKey) return json(res, 503, { error: 'AI is not connected. Add GEMINI_API_KEY to .env.local and restart npm start. Manual entry works without a key.' });
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'Send JSON.' });
    if (Date.now() - windowStart > 60000) { requests = 0; windowStart = Date.now(); }
    if (busy || requests >= 10) return json(res, 429, { error: 'Please wait before making another AI plan.' });
    try {
      let body = '';
      for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 16000) return json(res, 413, { error: 'Message is too large.' }); }
      let input;
      try { input = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid request.' }); }
      if (!input || typeof input.message !== 'string' || !input.message.trim() || input.message.length > 2000 || typeof input.localNow !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.localNow) || typeof input.timeZone !== 'string' || input.timeZone.length > 100) return json(res, 400, { error: 'Provide a message, local date and time zone.' });
      try { new Intl.DateTimeFormat('en', { timeZone: input.timeZone }); } catch { return json(res, 400, { error: 'Invalid time zone.' }); }
      if (busy || requests >= 10) return json(res, 429, { error: 'Please wait before making another AI plan.' });
      busy = true; requests++;
      try { const actions = await requestPlan(input, { apiKey, model }); json(res, 200, { actions }); }
      finally { busy = false; }
    } catch (error) {
      json(res, error.status || 502, { error: error.status ? error.message : 'AI could not return a valid proposal. Try again or enter the task manually.', code: error.code || 'AI_RESPONSE' });
    }
    return;
  }
  if (path.startsWith('/api/')) return json(res, 404, { error: 'Unknown endpoint.' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });
  try {
    const relative = decodeURIComponent(path).replace(/^\/+/, '') || 'index.html';
    const target = resolve(root, relative);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.'))) return json(res, 403, { error: 'File not available.' });
    const content = await readFile(target);
    const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[extname(target)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' }); res.end(req.method === 'HEAD' ? undefined : content);
  } catch { json(res, 404, { error: 'File not found. Run npm run build before npm start.' }); }
});
server.requestTimeout = 40000;
server.listen(port, '127.0.0.1', () => console.log(`Sorted: http://127.0.0.1:${port} · AI ${apiKey ? 'configured' : 'not configured'}`));
