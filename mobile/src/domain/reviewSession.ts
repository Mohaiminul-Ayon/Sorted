import { reviewTasks } from './task';
import { DEFAULT_REVIEW, type ReviewState, type Task } from './types';

export const WEEKLY_LIMIT_MS = 15 * 60 * 1000;
export const SOMEDAY_INTERVAL_MS = 182 * 24 * 60 * 60 * 1000;

export function startWeeklyReview(tasks: Task[], review: ReviewState, now = new Date()): ReviewState {
  if (review.startedAt && !review.pausedAt) return review;
  if (review.startedAt && review.pausedAt) {
    return { ...review, pausedAt: null, startedAt: now.toISOString() };
  }
  const sessionIds = reviewTasks(tasks, review.sessions).map((task) => task.id);
  return {
    ...DEFAULT_REVIEW,
    ...review,
    startedAt: now.toISOString(),
    pausedAt: null,
    elapsedMs: 0,
    sessionIds,
    decisions: [],
  };
}

export function pauseWeeklyReview(review: ReviewState, now = new Date()): ReviewState {
  if (!review.startedAt || review.pausedAt) return review;
  const extra = now.getTime() - new Date(review.startedAt).getTime();
  return { ...review, pausedAt: now.toISOString(), elapsedMs: review.elapsedMs + extra, startedAt: review.startedAt };
}

export function activeElapsedMs(review: ReviewState, now = new Date()): number {
  if (!review.startedAt || review.pausedAt) return review.elapsedMs;
  return review.elapsedMs + (now.getTime() - new Date(review.startedAt).getTime());
}

export function weeklyTimeUp(review: ReviewState, now = new Date()): boolean {
  return activeElapsedMs(review, now) >= WEEKLY_LIMIT_MS;
}

export function completeWeeklyReview(review: ReviewState): ReviewState {
  return {
    ...DEFAULT_REVIEW,
    sessions: review.sessions + 1,
    lastSomedayAt: review.lastSomedayAt,
  };
}

export function markSomedayReviewed(review: ReviewState, now = new Date()): ReviewState {
  return { ...review, lastSomedayAt: now.toISOString() };
}

export function somedayIsDue(review: ReviewState, now = new Date()): boolean {
  if (!review.lastSomedayAt) return true;
  return now.getTime() - new Date(review.lastSomedayAt).getTime() >= SOMEDAY_INTERVAL_MS;
}

export function groupByProject<T extends { projectId: string | null }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.projectId ?? 'none';
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}
