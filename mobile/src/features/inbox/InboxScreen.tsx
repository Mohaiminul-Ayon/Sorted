import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { CaptureSheet } from '../capture/CaptureSheet';
import { colors, space } from '../../ui/theme';
import type { TaskState } from '../../domain/types';

const FILTERS: TaskState[] = ['Inbox', 'Schedule now', 'Important', 'Someday', 'Done'];

export function InboxScreen() {
  const { tasks } = useApp();
  const [filter, setFilter] = useState<TaskState>('Inbox');
  const [open, setOpen] = useState(false);
  const list = tasks.filter((t) => !t.deleted && t.state === filter);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Let’s make a little room.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setOpen(true)} style={styles.capture}>
        <Text style={styles.captureText}>Capture</Text>
      </Pressable>
      <ScrollView>
        {list.length === 0 && filter === 'Inbox' ? <Text style={styles.empty}>You’re sorted.</Text> : null}
        {list.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.title}</Text>
            <Text style={styles.cardMeta}>{t.source}</Text>
          </View>
        ))}
      </ScrollView>
      <CaptureSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: space.l },
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  filters: { flexGrow: 0, marginBottom: space.m },
  chip: { marginRight: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.paper, borderRadius: 16 },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.paper },
  capture: { alignSelf: 'flex-start', marginBottom: space.m },
  captureText: { color: colors.accent, fontWeight: '600' },
  empty: { color: colors.leaf, fontSize: 16 },
  card: { backgroundColor: colors.paper, padding: space.m, borderRadius: 14, marginBottom: space.s },
  cardTitle: { color: colors.ink, fontSize: 16 },
  cardMeta: { color: colors.muted, marginTop: 4 },
});
