import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_SCHEMA_VERSION, assertMigrationsSafe, migrationStatements } from './migrations';
import { SCHEMA_SQL } from '../data/schema';
import { aiRequiresNetworkMessage, offlineStatusLabel } from './network';

test('bootstrap creates tables without dropping data', () => {
  assert.match(SCHEMA_SQL, /CREATE TABLE IF NOT EXISTS tasks/);
  assert.doesNotMatch(SCHEMA_SQL.toUpperCase(), /DROP TABLE/);
  assert.equal(APP_SCHEMA_VERSION, 1);
});

test('same-version migrate is a no-op and never wipes tasks', () => {
  const sql = migrationStatements(1, 1);
  assert.deepEqual(sql, []);
  assertMigrationsSafe(sql);
});

test('newer database refuses to run an older app without deleting rows', () => {
  assert.throws(() => migrationStatements(99, 1), /Update the app/);
});

test('offline copy does not scare the user and AI is optional', () => {
  assert.match(offlineStatusLabel(false), /plan stays here/);
  assert.match(aiRequiresNetworkMessage(), /Inbox still works/);
});
