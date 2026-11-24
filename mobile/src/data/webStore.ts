import { Platform } from 'react-native';
import type { Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { DEFAULT_REVIEW, DEFAULT_SETTINGS, normalizeReview } from '../domain/types';
import { APP_SCHEMA_VERSION } from '../domain/migrations';

const KEY = 'sorted-web-plan-v1';

export const isWebPersistence = Platform.OS === 'web';

type Snapshot = {
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
  schemaVersion: number;
  lastOpenedAt: string | null;
};

const empty = (): Snapshot => ({
  tasks: [],
  projects: [],
  meetings: [],
  settings: DEFAULT_SETTINGS,
  review: DEFAULT_REVIEW,
  schemaVersion: APP_SCHEMA_VERSION,
  lastOpenedAt: new Date().toISOString(),
});

export function readWebSnapshot(): Snapshot {
  if (typeof localStorage === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      ...empty(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      review: normalizeReview(parsed.review),
      lastOpenedAt: new Date().toISOString(),
    };
  } catch {
    return empty();
  }
}

export function writeWebSnapshot(patch: Partial<Snapshot>): Snapshot {
  const next = { ...readWebSnapshot(), ...patch, lastOpenedAt: new Date().toISOString() };
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
