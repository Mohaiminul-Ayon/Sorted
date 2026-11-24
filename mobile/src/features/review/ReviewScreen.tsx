import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../shell/AppContext';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';
import { reviewTasks } from '../../domain/task';
import {
  activeElapsedMs,
  completeWeeklyReview,
  groupByProject,
  markSomedayReviewed,
  pauseWeeklyReview,
  somedayIsDue,
  startWeeklyReview,
  weeklyTimeUp,
} from '../../domain/reviewSession';
import type { Task } from '../../domain/types';

export function ReviewScreen() {
  const { settings, tasks, projects, review, saveReviewState, openTask } = useApp();
  const [now, setNow] = useState(() => Date.now());
  const [somedayMode, setSomedayMode] = useState(false);
  const [postponed, setPostponed] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = activeElapsedMs(review, new Date(now));
  const weeklyItems = reviewTasks(tasks, review.sessions, review.sessionIds);
  const remainingWeekly = weeklyItems.filter((task) => !review.decisions.includes(task.id) && !task.deleted && task.state === 'Important');
  const somedayItems = tasks.filter((task) => !task.deleted && task.state === 'Someday' && !postponed.includes(task.id));
  const groupedSomeday = useMemo(() => groupByProject(somedayItems), [somedayItems]);
  const current: Task | undefined = somedayMode ? somedayItems[0] : remainingWeekly[0];
  const timeUp = weeklyTimeUp(review, new Date(now));

  const begin = async () => {
    await saveReviewState(startWeeklyReview(tasks, review, new Date()));
    setSomedayMode(false);
  };

  const pause = async () => {
    await saveReviewState(pauseWeeklyReview(review, new Date()));
  };

  const finish = async () => {
    await saveReviewState(completeWeeklyReview(review));
  };

  const decideSomedayKeep = async () => {
    if (!current) return;
    setPostponed((ids) => [...ids, current.id]);
  };

  return (
    <Screen>
      <Text style={styles.title}>A fresh perspective.</Text>
      <Text style={styles.body}>Weekly review on {settings.weekend}s, up to 15 minutes. Oldest Important items first, grouped by project after you open them. First three weeks are unlimited; then twenty items.</Text>
      <Text style={styles.stat}>
        {Math.floor(elapsed / 60000)} min of active review
        {review.pausedAt ? ' · paused' : ''}
        {timeUp ? ' · a good time to stop' : ''}
      </Text>
      {!review.startedAt ? (
        <Pressable style={styles.primary} onPress={() => void begin()} accessibilityLabel="Begin weekly review">
          <Text style={styles.primaryText}>Begin a gentle review</Text>
        </Pressable>
      ) : (
        <View style={styles.row}>
          {review.pausedAt ? (
            <Pressable onPress={() => void begin()} accessibilityLabel="Resume weekly review">
              <Text style={styles.link}>Resume</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => void pause()} accessibilityLabel="Pause weekly review">
              <Text style={styles.link}>Pause</Text>
            </Pressable>
          )}
          <Pressable onPress={() => void finish()} accessibilityLabel="Finish weekly review">
            <Text style={styles.link}>Finish</Text>
          </Pressable>
        </View>
      )}
      {review.startedAt && !somedayMode ? (
        current ? (
          <View style={styles.card}>
            <Text style={styles.pill}>{projects.find((project) => project.id === current.projectId)?.name ?? 'A thought of your own'}</Text>
            <Text style={styles.name}>{current.title}</Text>
            <Text style={styles.body}>{current.originalText}</Text>
            {current.reschedules.slice(-2).map((entry) => (
              <Text key={entry.time} style={styles.muted}>{entry.reason}</Text>
            ))}
            <Pressable onPress={() => openTask(current)} accessibilityLabel={`Schedule ${current.title}`}>
              <Text style={styles.link}>Find a time · Schedule now</Text>
            </Pressable>
            <Pressable
              onPress={() => void saveReviewState({ ...review, decisions: [...review.decisions, current.id] })}
              accessibilityLabel={`Keep ${current.title} in Important`}
            >
              <Text style={styles.link}>Keep in Important</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.sorted}>You’re sorted.</Text>
        )
      ) : null}
      <Pressable onPress={() => setSomedayMode(true)} accessibilityLabel="Open Someday review">
        <Text style={styles.section}>Someday · {somedayIsDue(review) ? 'due for a look' : 'open anytime'}</Text>
      </Pressable>
      {somedayMode ? (
        <View>
          <Text style={styles.body}>Grouped by project. Postpone a group if this is not the moment.</Text>
          {current ? (
            <View style={styles.card}>
              <Text style={styles.name}>{current.title}</Text>
              <Pressable onPress={() => openTask(current)} accessibilityLabel={`Bring ${current.title} closer`}>
                <Text style={styles.link}>Bring to Important or schedule</Text>
              </Pressable>
              <Pressable onPress={() => void decideSomedayKeep()} accessibilityLabel={`Keep ${current.title} in Someday`}>
                <Text style={styles.link}>Keep in Someday</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.sorted}>You’re sorted.</Text>
          )}
          {[...groupedSomeday.entries()].map(([key, group]) => (
            <Pressable
              key={key}
              onPress={() => setPostponed((ids) => [...ids, ...group.map((task) => task.id)])}
              accessibilityLabel={`Postpone ${group.length} someday items`}
            >
              <Text style={styles.muted}>Postpone {group.length} in {projects.find((project) => project.id === key)?.name ?? 'no project'}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => void saveReviewState(markSomedayReviewed(review))} accessibilityLabel="Mark Someday review done">
            <Text style={styles.link}>Mark this Someday look done</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.muted, lineHeight: 22, marginBottom: space.m },
  stat: { marginBottom: space.l, color: colors.ink },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center', marginBottom: space.m },
  primaryText: { color: colors.paper, fontWeight: '600' },
  row: { flexDirection: 'row', gap: space.l, marginBottom: space.m },
  link: { color: colors.accent, marginBottom: space.s, minHeight: 44 },
  card: { backgroundColor: colors.paper, padding: space.m, borderRadius: 16, marginBottom: space.m },
  pill: { color: colors.accent, marginBottom: 6 },
  name: { fontSize: 20, color: colors.ink, fontWeight: '600', marginBottom: space.s },
  muted: { color: colors.muted, marginBottom: 8 },
  sorted: { color: colors.leaf, fontSize: 16, marginBottom: space.m },
  section: { fontSize: 18, color: colors.ink, fontWeight: '600', marginTop: space.l, marginBottom: space.s },
});
