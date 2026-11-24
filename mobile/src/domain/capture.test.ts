import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeCaptureSource,
  inboxTitlesFromCapture,
  pickSpeechLocale,
  shareTextFromIntent,
  sourceAppFromIntent,
} from './capture';
import { createTask } from './task';

test('multi-line share becomes one Inbox title per action and keeps the original message', () => {
  const text = 'Call the supplier tomorrow\nPay the hall deposit\n\nBook the electrician';
  const titles = inboxTitlesFromCapture(text);
  assert.deepEqual(titles, ['Call the supplier tomorrow', 'Pay the hall deposit', 'Book the electrician']);
  const tasks = titles.map((title) => createTask(title, { originalText: text, source: 'shared', sourceApp: 'com.whatsapp' }));
  assert.equal(tasks.length, 3);
  assert.ok(tasks.every((task) => task.state === 'Inbox' && task.originalText === text && task.source === 'shared'));
});

test('blank capture has no titles', () => {
  assert.deepEqual(inboxTitlesFromCapture('  \n  '), []);
});

test('speech locale prefers installed device language then English', () => {
  assert.equal(pickSpeechLocale('bn-BD', ['en-US', 'bn-BD'], ['en-US']), 'bn-BD');
  assert.equal(pickSpeechLocale('bn_BD', ['en-US', 'bn-IN'], []), 'bn-IN');
  assert.equal(pickSpeechLocale('fr-FR', ['en-GB'], []), 'en-GB');
  assert.equal(pickSpeechLocale(undefined, [], []), 'en-US');
});

test('shared text prefers body over metadata and records the sending app', () => {
  assert.equal(
    shareTextFromIntent({ text: '  Call Ali  ', webUrl: 'https://maps.example/x', meta: { title: 'Maps' } }),
    'Call Ali\nhttps://maps.example/x',
  );
  assert.equal(sourceAppFromIntent({ meta: { packageName: 'com.google.android.gm' } }), 'com.google.android.gm');
  assert.equal(describeCaptureSource('shared', 'Gmail'), 'shared · Gmail');
  assert.equal(describeCaptureSource('voice', null), 'voice');
});
