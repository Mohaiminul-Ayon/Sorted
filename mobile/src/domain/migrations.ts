/** Increment only with additive SQL. Never DROP task/project/meeting tables. */
export const APP_SCHEMA_VERSION = 1;

const STEPS: { to: number; sql: string[] }[] = [
  // 1 = CREATE TABLE IF NOT EXISTS (applied on every boot). Extra steps start at 2.
];

export function migrationStatements(fromVersion: number, toVersion = APP_SCHEMA_VERSION): string[] {
  if (!Number.isInteger(fromVersion) || fromVersion < 0) {
    throw new Error('Unknown database version.');
  }
  if (fromVersion > toVersion) {
    throw new Error(
      'This copy of Sorted is older than the plan on this device. Update the app. Your tasks are not deleted.',
    );
  }
  const sql: string[] = [];
  for (const step of STEPS) {
    if (step.to > fromVersion && step.to <= toVersion) sql.push(...step.sql);
  }
  return sql;
}

export function assertMigrationsSafe(statements: string[]): void {
  const joined = statements.join('\n').toUpperCase();
  if (joined.includes('DROP TABLE')) throw new Error('Migrations must not drop tables.');
  if (joined.includes('DELETE FROM TASKS')) throw new Error('Migrations must not wipe tasks.');
}
