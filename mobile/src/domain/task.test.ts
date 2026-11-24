import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, transition, validateSchedule, needsAttention, reviewTasks, localDay } from './task';
import { toCSV, toExportDocument, assertExportDocument } from './exportDoc';
import { DEFAULT_SETTINGS } from './types';

test('capture preserves original context and rejects blank titles', () => {
  assert.throws(() => createTask('  '));
  const task = createTask('One action', { originalText: 'A longer shared message', source: 'shared' });
  assert.equal(task.state, 'Inbox');
  assert.equal(task.originalText, 'A longer shared message');
  assert.ok(task.id);
});

test('readiness requires time, positive duration, and energy but no prerequisite', () => {
  const task = createTask('Plan');
  assert.throws(() => transition(task, 'Schedule now'));
  const fields = { start: '2026-11-15T10:00', duration: 30, energy: 'High' as const };
  assert.equal(validateSchedule(fields), '');
  assert.notEqual(validateSchedule({ ...fields, duration: -1 }), '');
  assert.notEqual(validateSchedule({ ...fields, energy: null }), '');
  const scheduled = transition(task, 'Schedule now', fields);
  const moved = transition(scheduled, 'Important', { reason: 'Needs more thought' });
  assert.equal(moved.reschedules[0].reason, 'Needs more thought');
  assert.equal(moved.history.length, 2);
});

test('missed slots surface after their duration and ignore completed/deleted tasks', () => {
  const task = transition(createTask('Walk'), 'Schedule now', { start: '2026-11-15T10:00', duration: 30, energy: 'Low' });
  const now = new Date('2026-11-15T11:00').getTime();
  assert.equal(needsAttention(task, now), true);
  assert.equal(needsAttention({ ...task, deleted: true }, now), false);
  assert.equal(needsAttention(transition(task, 'Done'), now), false);
});

test('first three weekly sessions are unlimited; fourth has 20 items', () => {
  const tasks = Array.from({ length: 25 }, () => transition(createTask('Think'), 'Important'));
  assert.equal(reviewTasks(tasks, 2).length, 25);
  assert.equal(reviewTasks(tasks, 3).length, 20);
});

test('CSV and JSON export match the data contract', () => {
  const task = createTask('Read "one", then\ntwo');
  assert.match(toCSV([task]), /"Read ""one"", then\ntwo"/);
  const doc = toExportDocument({
    tasks: [task],
    projects: [],
    meetings: [],
    settings: { ...DEFAULT_SETTINGS, onboarded: true },
    review: { sessions: 0, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null },
    exportedAt: '2026-11-25T00:00:00.000Z',
  });
  assertExportDocument(doc);
  assert.equal(doc.schemaVersion, 1);
  assert.equal(doc.tasks[0].state, 'Inbox');
});

test('local dates retain local day', () => {
  assert.equal(localDay(new Date(2026, 0, 2, 0, 1)), '2026-01-02');
});

test('parseJsonRecord skips corrupt JSON and isClock validates hours', async () => {
  const { parseJsonRecord, isClock } = await import('./parse');
  assert.equal(parseJsonRecord('{"id":"a"}', 'task')?.id, 'a');
  assert.equal(parseJsonRecord('{', 'task'), null);
  assert.equal(parseJsonRecord('null', 'task'), null);
  assert.equal(isClock('09:00'), true);
  assert.equal(isClock('24:00'), false);
  assert.equal(isClock('9:00'), false);
});
