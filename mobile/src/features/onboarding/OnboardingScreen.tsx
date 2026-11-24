import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { colors, space } from '../../ui/theme';
import type { Settings } from '../../domain/types';

const DAYS: Settings['weekend'][] = ['Friday', 'Saturday', 'Sunday'];

export function OnboardingScreen() {
  const { completeOnboarding, settings } = useApp();
  const [weekend, setWeekend] = useState<Settings['weekend']>(settings.weekend);
  const [workStart] = useState(settings.workStart);
  const [workEnd] = useState(settings.workEnd);

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>YOUR RHYTHM</Text>
      <Text style={styles.title}>When do you review the week?</Text>
      <Text style={styles.body}>Choose a weekend day and usual working hours. You can change this later.</Text>
      <View style={styles.row}>
        {DAYS.map((day) => (
          <Pressable key={day} onPress={() => setWeekend(day)} style={[styles.chip, weekend === day && styles.chipOn]}>
            <Text style={[styles.chipText, weekend === day && styles.chipTextOn]}>{day}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hours}>Working hours {workStart} – {workEnd}</Text>
      <Pressable
        style={styles.primary}
        onPress={() => void completeOnboarding({ weekend, workStart, workEnd })}
        accessibilityLabel="Save rhythm and continue"
      >
        <Text style={styles.primaryText}>Continue</Text>
      </Pressable>
      <Text style={styles.note}>Notification permission will be explained in context when reminders are added. Notification Listener stays off unless you opt in later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: space.l, justifyContent: 'center' },
  eyebrow: { color: colors.accent, letterSpacing: 1.2, fontSize: 12, marginBottom: space.s },
  title: { color: colors.ink, fontSize: 28, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: space.l },
  row: { flexDirection: 'row', gap: space.s, marginBottom: space.l },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.paper },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.paper },
  hours: { color: colors.ink, marginBottom: space.l },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: colors.paper, fontSize: 16, fontWeight: '600' },
  note: { color: colors.muted, marginTop: space.l, fontSize: 13, lineHeight: 20 },
});
