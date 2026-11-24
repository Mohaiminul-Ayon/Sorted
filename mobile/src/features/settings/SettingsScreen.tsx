import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../app/AppContext';
import { toCSV, toExportDocument } from '../../domain/exportDoc';
import { colors, space } from '../../ui/theme';
import { localDay } from '../../domain/task';

export function SettingsScreen() {
  const { settings, tasks, projects, meetings, review } = useApp();

  const exportJson = async () => {
    const doc = toExportDocument({ tasks, projects, meetings, settings, review });
    const path = `${cacheDirectory}sorted-${localDay()}.json`;
    await writeAsStringAsync(path, JSON.stringify(doc, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
  };

  const exportCsv = async () => {
    const path = `${cacheDirectory}sorted-${localDay()}.csv`;
    await writeAsStringAsync(path, toCSV(tasks));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Your space, your rhythm.</Text>
      <Text style={styles.body}>Weekend review: {settings.weekend}. Hours {settings.workStart}–{settings.workEnd}.</Text>
      <Text style={styles.note}>There is no cloud backup. Export is your copy.</Text>
      <Pressable style={styles.primary} onPress={() => void exportJson()} accessibilityLabel="Export all data as JSON">
        <Text style={styles.primaryText}>Export all data · JSON</Text>
      </Pressable>
      <Pressable onPress={() => void exportCsv()} accessibilityLabel="Export tasks as CSV">
        <Text style={styles.link}>Export tasks · CSV</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: space.l },
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.ink, marginBottom: space.s },
  note: { color: colors.muted, marginBottom: space.l },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: colors.paper, fontWeight: '600' },
  link: { color: colors.accent, marginTop: space.m, textAlign: 'center' },
});
