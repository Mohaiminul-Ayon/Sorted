import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../shell/AppContext';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';
import { needsAttention } from '../../domain/task';
import { describeCaptureSource } from '../../domain/capture';
import type { TaskState } from '../../domain/types';

const FILTERS = ['Inbox', 'Schedule now', 'Important', 'Someday', 'Done', 'Needs attention'] as const;
type Filter = (typeof FILTERS)[number];

export function InboxScreen() {
  const { tasks, openCapture, openTask } = useApp();
  const [filter, setFilter] = useState<Filter>('Inbox');
  const list =
    filter === 'Needs attention'
      ? tasks.filter((t) => needsAttention(t))
      : tasks.filter((t) => !t.deleted && t.state === (filter as TaskState));

  return (
    <Screen>
      <Text style={styles.title}>Let’s make a little room.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: filter === f }} accessibilityLabel={`Show ${f}`}>
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => openCapture()} style={styles.capture} accessibilityLabel="Capture a thought">
        <Text style={styles.captureText}>Capture</Text>
      </Pressable>
      <ScrollView>
        {list.length === 0 && filter === 'Inbox' ? <Text style={styles.empty}>You’re sorted.</Text> : null}
        {list.map((t) => (
          <Pressable key={t.id} style={styles.card} onPress={() => openTask(t)} accessibilityLabel={`${t.title}, ${t.state}`}>
            <Text style={styles.cardTitle}>{t.title}</Text>
            <Text style={styles.cardMeta}>{describeCaptureSource(t.source, t.sourceApp)}</Text>
            {t.originalText && t.originalText !== t.title ? <Text style={styles.cardMeta}>{t.originalText}</Text> : null}
            {t.reschedules.at(-1) ? <Text style={styles.cardMeta}>{t.reschedules.at(-1)?.reason}</Text> : null}
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  filters: { flexGrow: 0, marginBottom: space.m },
  chip: { marginRight: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.paper, borderRadius: 16, minHeight: 44, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.paper },
  capture: { alignSelf: 'flex-start', marginBottom: space.m, minHeight: 44, justifyContent: 'center' },
  captureText: { color: colors.accent, fontWeight: '600' },
  empty: { color: colors.leaf, fontSize: 16 },
  card: { backgroundColor: colors.paper, padding: space.m, borderRadius: 14, marginBottom: space.s },
  cardTitle: { color: colors.ink, fontSize: 16 },
  cardMeta: { color: colors.muted, marginTop: 4 },
});
