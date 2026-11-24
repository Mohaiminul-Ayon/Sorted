import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { isClock } from '../../domain/parse';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';
import type { Settings } from '../../domain/types';

const DAYS: Settings['weekend'][] = ['Friday', 'Saturday', 'Sunday'];

export function OnboardingScreen() {
  const { completeOnboarding, settings } = useApp();
  const [weekend, setWeekend] = useState<Settings['weekend']>(settings.weekend);
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!isClock(workStart) || !isClock(workEnd)) {
      setError('Use 24-hour times like 09:00.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await completeOnboarding({ weekend, workStart, workEnd });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your rhythm.');
      setBusy(false);
    }
  };

  return (
    <Screen>
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
      <Text style={styles.label}>Working hours</Text>
      <View style={styles.row}>
        <TextInput value={workStart} onChangeText={setWorkStart} style={styles.time} accessibilityLabel="Work start time" keyboardType="numbers-and-punctuation" />
        <Text style={styles.hours}>to</Text>
        <TextInput value={workEnd} onChangeText={setWorkEnd} style={styles.time} accessibilityLabel="Work end time" keyboardType="numbers-and-punctuation" />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.primary, busy && styles.disabled]}
        onPress={() => void save()}
        disabled={busy}
        accessibilityLabel="Save rhythm and continue"
      >
        <Text style={styles.primaryText}>Continue</Text>
      </Pressable>
      <Text style={styles.note}>Notification permission will be explained in context when reminders are added. Notification Listener stays off unless you opt in later.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accent, letterSpacing: 1.2, fontSize: 12, marginBottom: space.s },
  title: { color: colors.ink, fontSize: 28, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: space.l },
  row: { flexDirection: 'row', gap: space.s, marginBottom: space.l, alignItems: 'center' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.paper },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.paper },
  label: { color: colors.ink, marginBottom: space.s },
  time: { flex: 1, backgroundColor: colors.paper, borderRadius: 12, padding: space.m, color: colors.ink, fontSize: 16 },
  hours: { color: colors.ink },
  error: { color: '#8A4A4A', marginBottom: space.m },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.paper, fontSize: 16, fontWeight: '600' },
  note: { color: colors.muted, marginTop: space.l, fontSize: 13, lineHeight: 20 },
});
