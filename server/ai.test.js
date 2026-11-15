import test from 'node:test';
import assert from 'node:assert/strict';
import { requestPlan } from './ai.js';
import { validateProposals } from '../src/ai-contract.js';
import { aiProposalsToTasks } from '../src/organize.js';

const now = new Date(2026, 10, 16, 9);
const action = { title: 'Meet Shafiq', state: 'Schedule now', start: '2026-11-16T15:00', fixedTime: true, duration: 30, energy: 'Medium', priority: 'Medium', explanation: 'A stated meeting time; duration estimated.', clarification: '' };
const modelResponse = actions => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ actions }) }] } }] });
test('AI request uses the generateContent JSON contract and a server-side key', async () => {
  const actions = await requestPlan({ message: 'Meet Shafiq at 3pm', localNow: '2026-11-16T09:00', timeZone: 'Asia/Dhaka' }, {
    apiKey: 'test-placeholder', model: 'test-model', fetchImpl: async (url, options) => {
      assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent');
      assert.equal(options.headers['x-goog-api-key'], 'test-placeholder');
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.responseMimeType, 'application/json');
      assert.ok(body.generationConfig.responseJsonSchema.properties.actions);
      assert.equal(JSON.parse(body.contents[0].parts[0].text).timeZone, 'Asia/Dhaka');
      return modelResponse([action]);
    },
  });
  assert.equal(actions[0].title, 'Meet Shafiq');
});
test('model output is validated beyond JSON formatting', () => {
  assert.throws(() => validateProposals({ actions: [{ ...action, duration: -1 }] }));
  assert.throws(() => validateProposals({ actions: [{ ...action, state: 'Done' }] }));
  assert.throws(() => validateProposals({ actions: [{ ...action, title: '' }] }));
  assert.throws(() => validateProposals({ actions: [{ ...action, energy: 'unknown' }] }));
});
test('AI failures and quota errors remain recoverable without exposing provider responses', async () => {
  await assert.rejects(() => requestPlan({}, { apiKey: 'test', model: 'test', fetchImpl: async () => new Response('private-provider-details', { status: 429 }) }), /usage limit/);
  await assert.rejects(() => requestPlan({}, { apiKey: 'test', model: 'test', fetchImpl: async () => Response.json({ status: 'completed', steps: [] }) }));
});
test('network, missing-model and truncated-response errors have safe actionable messages', async () => {
  await assert.rejects(() => requestPlan({}, { apiKey: 'test', model: 'test', fetchImpl: async () => { throw new TypeError('private network details'); } }), e => e.code === 'AI_NETWORK' && !e.message.includes('private'));
  await assert.rejects(() => requestPlan({}, { apiKey: 'test', model: 'test', fetchImpl: async () => new Response('private response', { status: 404 }) }), e => e.code === 'AI_HTTP_404' && e.message.includes('model'));
  await assert.rejects(() => requestPlan({}, { apiKey: 'test', model: 'test', fetchImpl: async () => Response.json({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{' }] } }] }) }), e => e.code === 'AI_RESPONSE');
});
test('one message containing three jobs produces three separate task drafts with shared context', async () => {
  const message = 'Call Alex tomorrow at 10am, send the proposal at 2pm and buy groceries at 6pm.';
  const items = [
    { ...action, title: 'Call Alex', start: '2026-11-17T10:00' },
    { ...action, title: 'Send the proposal', start: '2026-11-17T14:00', priority: 'High' },
    { ...action, title: 'Buy groceries', start: '2026-11-17T18:00', energy: 'Low' },
  ];
  const actions = await requestPlan({ message, localNow: '2026-11-16T09:00', timeZone: 'Asia/Dhaka' }, {
    apiKey: 'test', model: 'test', fetchImpl: async (_, options) => {
      assert.match(JSON.parse(options.body).systemInstruction.parts[0].text, /OWN array item/);
      return modelResponse(items);
    },
  });
  const drafts = aiProposalsToTasks({ actions }, message, { now });
  assert.equal(drafts.length, 3); assert.equal(new Set(drafts.map(t => t.id)).size, 3);
  assert.deepEqual(drafts.map(t => t.title), ['Call Alex', 'Send the proposal', 'Buy groceries']);
  assert.deepEqual(drafts.map(t => t.start), ['2026-11-17T10:00', '2026-11-17T14:00', '2026-11-17T18:00']);
  assert.ok(drafts.every(t => t.originalText === message && t.state === 'Schedule now'));
  assert.equal(drafts[1].priority, 'High'); assert.equal(drafts[2].energy, 'Low');
});
test('AI drafts retain context only when requested and enforce local conflicts', () => {
  const message = 'Meet Shafiq at 3pm to discuss the confidential proposal';
  const result = aiProposalsToTasks({ actions: [action] }, message, { now, keepContext: true });
  assert.equal(result[0].originalText, message); assert.equal(result[0].state, 'Schedule now');
  assert.equal(aiProposalsToTasks({ actions: [action] }, message, { now, keepContext: false })[0].originalText, '');
  const conflict = aiProposalsToTasks({ actions: [action] }, message, { now, tasks: [{ state: 'Schedule now', start: action.start, duration: 60 }] });
  assert.equal(conflict[0].state, 'Inbox'); assert.equal(conflict[0].needsClarification, true);
});
test('AI flexible proposals use free slots and invalid dates never become scheduled tasks', () => {
  const flexible = { ...action, fixedTime: false, start: '2026-11-16T09:00' };
  const result = aiProposalsToTasks({ actions: [flexible, { ...action, start: '2026-11-16T09:00' }] }, 'Two meetings', { now });
  assert.equal(result[0].start, '2026-11-16T09:30');
  const invalid = aiProposalsToTasks({ actions: [{ ...action, start: '2026-02-30T09:00' }] }, 'Meeting', { now });
  assert.equal(invalid[0].needsClarification, true); assert.equal(invalid[0].state, 'Inbox');
});
