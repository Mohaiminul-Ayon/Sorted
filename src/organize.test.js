import test from 'node:test';
import assert from 'node:assert/strict';
import { organizeMessage } from './organize.js';
import { validateSchedule } from './model.js';

const now = new Date(2026, 10, 16, 9, 0);
const organize = (message, options = {}) => organizeMessage(message, { now, ...options });

test('extracts the user message into three actions and clarifies midnight only', () => {
  const source = 'SIr today we have a meeting at 12:00 am and we need to go on that ofiice 3 pm and sunday mr shafiq will come at 6pm';
  const result = organize(source);
  assert.equal(result.length, 3);
  assert.equal(result[0].state, 'Inbox'); assert.match(result[0].autoExplanation, /midnight/);
  assert.equal(result[1].start, '2026-11-16T15:00');
  assert.equal(result[2].start, '2026-11-22T18:00');
  assert.ok(result.every(t => t.originalText === source));
  assert.ok(result.filter(t => t.state === 'Schedule now').every(t => validateSchedule(t) === ''));
});
test('schedules clear commitments automatically and respects AM/PM', () => {
  assert.equal(organize('Meet Maya tomorrow at 12 pm')[0].start, '2026-11-17T12:00');
  assert.equal(organize('Call Sam tomorrow at 08:30 for 1 hour')[0].duration, 60);
  assert.equal(organize('Call Sam tomorrow at 08:30 for 1 hour')[0].start, '2026-11-17T08:30');
});
test('assigns urgent flexible work to free time and reserves later fixed commitments first', () => {
  const result = organize('Urgent send the proposal today and meet Maya today at 9 am');
  assert.equal(result[0].start, '2026-11-16T09:30');
  assert.equal(result[0].priority, 'High');
  assert.equal(result[1].start, '2026-11-16T09:00');
});
test('avoids task and meeting conflicts rather than moving explicit commitments', () => {
  const tasks = [{ state: 'Schedule now', start: '2026-11-16T15:00', duration: 60 }];
  assert.equal(organize('Visit the office today at 3 pm', { tasks })[0].needsClarification, true);
  const meetings = [{ date: '2026-11-16T09:00' }];
  assert.equal(organize('Urgent send the proposal', { meetings })[0].start, '2026-11-16T09:30');
});
test('classifies undated actions and future possibilities without inventing dates', () => {
  assert.equal(organize('Maybe learn pottery someday')[0].state, 'Someday');
  assert.equal(organize('Prepare a launch plan')[0].state, 'Important');
  assert.equal(organize('The weather is nice')[0].state, 'Inbox');
});
test('flags past times, bare hours, vague dates and deadlines', () => {
  for (const text of ['Meet Sam today at 8 am', 'Meet Sam at 6', 'Meet Sam next week at 6pm', 'Submit proposal by 3pm', 'Meet Sam tomorrow at 25:00']) {
    const task = organize(text)[0]; assert.equal(task.needsClarification, true, text); assert.notEqual(task.state, 'Schedule now', text);
  }
});
test('no available time preserves the urgent action without overbooking or dropping it', () => {
  const task = organize('Urgent call Sam today', { settings: { workStart: '08:00', workEnd: '08:30' } })[0];
  assert.equal(task.state, 'Important'); assert.equal(task.needsClarification, true);
});
test('flexible tasks avoid quiet hours and avoid each other', () => {
  const result = organize('Urgent call Sam today and send the report today', { settings: { workStart: '09:00', workEnd: '18:00', quietStart: '09:00', quietEnd: '10:00' } });
  assert.equal(result[0].start, '2026-11-16T10:00');
  assert.equal(result[1].start, '2026-11-16T10:30');
});
test('generating a proposal never mutates the existing saved plan or settings', () => {
  const tasks = [{ id: 'existing', state: 'Schedule now', start: '2026-11-16T09:00', duration: 30 }];
  const settings = { workStart: '09:00', workEnd: '18:00' };
  const before = JSON.stringify({ tasks, settings });
  const drafts = organize('Urgent send the report today', { tasks, settings });
  assert.equal(JSON.stringify({ tasks, settings }), before);
  assert.equal(tasks.length, 1); assert.equal(drafts.length, 1);
  assert.equal(drafts[0].start, '2026-11-16T09:30');
});
test('Pages message preview separates comma-delimited jobs while preserving shared dates', () => {
  const message = 'Call Alex tomorrow at 10am, send the proposal at 2pm and buy groceries at 6pm';
  const result = organize(message);
  assert.equal(result.length, 3);
  assert.deepEqual(result.map(t => t.start), ['2026-11-17T10:00', '2026-11-17T14:00', '2026-11-17T18:00']);
  assert.ok(result.every(t => t.originalText === message));
  assert.equal(organize('Buy apples and oranges someday').length, 1);
});
