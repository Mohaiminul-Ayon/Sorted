import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { CaptureSheet } from '../capture/CaptureSheet';
import { localDay, needsAttention } from '../../domain/task';
import { offlineStatusLabel } from '../../domain/network';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';

export function HomeScreen() {
  const { tasks, meetings, online } = useApp();
  const [open, setOpen] = useState(false);
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
        <Pressable style={styles.capture} onPress={() => setOpen(true)} accessibilityLabel="Quick capture">
          <Text style={styles.captureTitle}>Capture a thought</Text>
          <Text style={styles.captureHint}>Title only. Sort it when you have a moment.</Text>
        </Pressable>
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
        {inbox.length === 0 ? <Text style={styles.sorted}>You’re sorted.</Text> : null}
        <Text style={styles.section}>Today</Text>
        {today.length === 0 ? <Text style={styles.muted}>Your day has space.</Text> : today.map((t) => (
          <Text key={t.id} style={styles.row}>{t.title}</Text>
        ))}
        {nextMeeting ? (
          <View style={styles.meeting}>
            <Text style={styles.muted}>Next meeting</Text>
            <Text style={styles.row}>{nextMeeting.title}</Text>
          </View>
        ) : null}
      </ScrollView>
      <CaptureSheet visible={open} onClose={() => setOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.l, paddingBottom: 48 },
  eyebrow: { color: colors.accent, marginBottom: space.s },
  device: { color: colors.leaf, marginBottom: space.s, fontSize: 14 },
  title: { fontSize: 28, color: colors.ink, fontWeight: '600', marginBottom: space.l },
  capture: { backgroundColor: colors.paper, padding: space.l, borderRadius: 18, marginBottom: space.l },
  captureTitle: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  captureHint: { color: colors.muted, marginTop: 4 },
  counts: { flexDirection: 'row', gap: space.m, marginBottom: space.l },
  countCard: { flex: 1, backgroundColor: colors.paper, padding: space.m, borderRadius: 16 },
  count: { fontSize: 24, color: colors.ink, fontWeight: '600' },
  countLabel: { color: colors.muted },
  sorted: { color: colors.leaf, marginBottom: space.m, fontSize: 16 },
  section: { fontSize: 18, color: colors.ink, fontWeight: '600', marginBottom: space.s },
  muted: { color: colors.muted, marginBottom: space.m },
  row: { color: colors.ink, paddingVertical: 8 },
  meeting: { marginTop: space.m, backgroundColor: colors.paper, padding: space.m, borderRadius: 16 },
});
