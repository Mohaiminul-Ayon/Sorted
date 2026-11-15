import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, transition, validateSchedule, needsAttention, reviewTasks, toCSV, localDay } from './model.js';
test('capture preserves original context and rejects blank titles', () => {
  assert.throws(() => createTask('  '));
  const task = createTask('One action', { originalText: 'A longer shared message', source: 'shared' });
  assert.equal(task.state, 'Inbox'); assert.equal(task.originalText, 'A longer shared message'); assert.ok(task.id);
});
test('readiness requires time, positive duration, and energy but no prerequisite', () => {
  const task = createTask('Plan');
  assert.throws(() => transition(task, 'Schedule now'));
  const fields = { start: '2026-11-15T10:00', duration: 30, energy: 'High' };
  assert.equal(validateSchedule(fields), '');
  assert.notEqual(validateSchedule({ ...fields, duration: -1 }), '');
  assert.notEqual(validateSchedule({ ...fields, energy: '' }), '');
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
  assert.equal(transition(task, 'Done').reschedules.length, 0);
});
test('first three weekly sessions are unlimited; fourth has 20 items', () => {
  const tasks = Array.from({ length: 25 }, () => transition(createTask('Think'), 'Important'));
  assert.equal(reviewTasks(tasks, 2).length, 25); assert.equal(reviewTasks(tasks, 3).length, 20);
  const ids = reviewTasks(tasks, 3).map(t => t.id);
  const changed = tasks.map((t, i) => i < 10 ? transition(t, 'Someday') : t);
  assert.equal(reviewTasks(changed, 3, ids).length, 10);
});
test('CSV quotes newlines, commas and quotes; local dates retain local day', () => {
  assert.match(toCSV([createTask('Read "one", then\ntwo')]), /"Read ""one"", then\ntwo"/);
  assert.ok(toCSV([createTask('=1+1')]).includes('"\'=1+1"'));
  assert.equal(localDay(new Date(2026, 0, 2, 0, 1)), '2026-01-02');
});
test('manual task details survive state changes and appear in exports', () => {
  const task = createTask('Prepare client proposal', { originalText: 'Client needs a cost breakdown.', priority: 'High', project: 'Client work' });
  const scheduled = transition(task, 'Schedule now', { start: '2026-11-17T15:00', duration: 45, energy: 'High' });
  const completed = transition(scheduled, 'Done');
  assert.equal(completed.priority, 'High');
  assert.equal(completed.duration, 45);
  assert.equal(completed.originalText, 'Client needs a cost breakdown.');
  const csv = toCSV([completed]);
  assert.match(csv.split('\r\n')[0], /state,priority,originalText/);
  assert.ok(csv.includes('"High"')); assert.ok(csv.includes('Client needs a cost breakdown.'));
});
