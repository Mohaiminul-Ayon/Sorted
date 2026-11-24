import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../shell/AppContext';
import { localDay, needsAttention } from '../../domain/task';
import { offlineStatusLabel } from '../../domain/network';
import { snoozeUntil } from '../../domain/reminders';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';

export function HomeScreen() {
  const { tasks, meetings, online, openCapture, openTask, settings, enableReminders, skipInboxUntil } = useApp();
  const [notice, setNotice] = useState('');
  const [skipArmed, setSkipArmed] = useState(false);
  const inbox = tasks.filter((t) => !t.deleted && t.state === 'Inbox');
  const today = useMemo(
    () =>
      tasks
        .filter((t) => !t.deleted && t.state === 'Schedule now' && t.start?.startsWith(localDay()))
        .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '')),
    [tasks],
  );
  const attention = tasks.filter((t) => needsAttention(t));
  const nextMeeting = meetings.find((m) => !m.deleted && m.startsAt.startsWith(localDay()));

  return (
    <Screen style={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        <Text style={styles.device}>{offlineStatusLabel(online)}</Text>
        <Text style={styles.title}>A little less on your mind.</Text>
        <Pressable style={styles.capture} onPress={() => openCapture()} accessibilityLabel="Quick capture">
          <Text style={styles.captureTitle}>Capture a thought</Text>
          <Text style={styles.captureHint}>Type, speak, or share into Inbox. Sort it when you have a moment.</Text>
        </Pressable>
        {!settings.notificationsEnabled ? (
          <Pressable
            style={styles.nudge}
            onPress={() => void enableReminders().then((ok) => setNotice(ok ? 'Gentle reminders are on. They wait through quiet hours and reboot with the app.' : 'Reminders stay off until you allow notifications.'))}
            accessibilityLabel="Turn on gentle reminders"
          >
            <Text style={styles.nudgeTitle}>Gentle reminders</Text>
            <Text style={styles.captureHint}>Sorted can nudge Inbox, timed plans, reviews, and an evening summary. Permission is asked only here.</Text>
          </Pressable>
        ) : null}
        <View style={styles.counts}>
          <View style={styles.countCard}>
            <Text style={styles.count}>{String(inbox.length).padStart(2, '0')}</Text>
            <Text style={styles.countLabel}>Inbox</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={styles.count}>{String(attention.length).padStart(2, '0')}</Text>
            <Text style={styles.countLabel}>Needs a new time</Text>
          </View>
        </View>
        {inbox.length === 0 ? <Text style={styles.sorted}>You’re sorted.</Text> : (
          skipArmed ? (
            <Pressable
              onPress={() => {
                void skipInboxUntil(snoozeUntil(new Date(), 24 * 60).toISOString());
                setSkipArmed(false);
                setNotice('Inbox reminders will wait until tomorrow. They come back then.');
              }}
              accessibilityLabel="Confirm pause Inbox reminders until tomorrow"
            >
              <Text style={styles.link}>Confirm: pause Inbox reminders until tomorrow</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setSkipArmed(true)} accessibilityLabel="Pause Inbox reminders">
              <Text style={styles.link}>Pause Inbox reminders until tomorrow</Text>
            </Pressable>
          )
        )}
        <Text style={styles.section}>Today</Text>
        {today.length === 0 ? <Text style={styles.muted}>Your day has space.</Text> : today.map((t) => (
          <Pressable key={t.id} onPress={() => openTask(t)} accessibilityLabel={`Open ${t.title}`}>
            <Text style={styles.row}>{t.title}</Text>
          </Pressable>
        ))}
        {attention.map((t) => (
          <Pressable key={t.id} onPress={() => openTask(t)} accessibilityLabel={`Needs a new time: ${t.title}`}>
            <Text style={styles.row}>Needs a new time · {t.title}</Text>
          </Pressable>
        ))}
        {nextMeeting ? (
          <View style={styles.meeting}>
            <Text style={styles.muted}>Next meeting</Text>
            <Text style={styles.row}>{nextMeeting.title}</Text>
          </View>
        ) : null}
        {notice ? <Text style={styles.muted}>{notice}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.l, paddingBottom: 48 },
  eyebrow: { color: colors.accent, marginBottom: space.s },
  device: { color: colors.leaf, marginBottom: space.s, fontSize: 14 },
  title: { fontSize: 28, color: colors.ink, fontWeight: '600', marginBottom: space.l },
  capture: { backgroundColor: colors.paper, padding: space.l, borderRadius: 18, marginBottom: space.l, minHeight: 88 },
  captureTitle: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  captureHint: { color: colors.muted, marginTop: 4 },
  nudge: { backgroundColor: colors.paper, padding: space.m, borderRadius: 16, marginBottom: space.l },
  nudgeTitle: { color: colors.ink, fontWeight: '600' },
  counts: { flexDirection: 'row', gap: space.m, marginBottom: space.l },
  countCard: { flex: 1, backgroundColor: colors.paper, padding: space.m, borderRadius: 16 },
  count: { fontSize: 24, color: colors.ink, fontWeight: '600' },
  countLabel: { color: colors.muted },
  sorted: { color: colors.leaf, marginBottom: space.m, fontSize: 16 },
  section: { fontSize: 18, color: colors.ink, fontWeight: '600', marginBottom: space.s },
  muted: { color: colors.muted, marginBottom: space.m },
  row: { color: colors.ink, paddingVertical: 12, minHeight: 44 },
  meeting: { marginTop: space.m, backgroundColor: colors.paper, padding: space.m, borderRadius: 16 },
  link: { color: colors.accent, marginBottom: space.m },
});
