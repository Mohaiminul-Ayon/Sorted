import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../shell/AppContext';
import { toCSV, toExportDocument } from '../../domain/exportDoc';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';
import { localDay } from '../../domain/task';
import { aiRequiresNetworkMessage, offlineStatusLabel } from '../../domain/network';

export function SettingsScreen() {
  const { settings, tasks, projects, meetings, review, online, schemaVersion, lastOpenedAt } = useApp();
  const [message, setMessage] = useState('');
  const [voiceLanguages, setVoiceLanguages] = useState('Voice languages load when this device supports recognition.');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          if (!cancelled) setVoiceLanguages('Voice capture is not available on this device.');
          return;
        }
        const { locales, installedLocales } = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        const installed = installedLocales.length ? ` Offline: ${installedLocales.join(', ')}.` : '';
        const listed = locales.length ? locales.join(', ') : 'device default (en-US fallback)';
        if (!cancelled) setVoiceLanguages(`Voice languages: ${listed}.${installed}`);
      } catch {
        if (!cancelled) setVoiceLanguages('Voice languages are listed after a native install with speech recognition.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const writeAndShare = async (filename: string, contents: string) => {
    if (!cacheDirectory) throw new Error('This device has no place to write an export file.');
    const path = `${cacheDirectory}${filename}`;
    await writeAsStringAsync(path, contents);
    if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available. The file was written on this device.');
    await Sharing.shareAsync(path);
  };

  const exportJson = async () => {
    try {
      const doc = toExportDocument({ tasks, projects, meetings, settings, review });
      await writeAndShare(`sorted-${localDay()}.json`, JSON.stringify(doc, null, 2));
      setMessage('Your export is ready. Keep it somewhere safe.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Export could not finish.');
    }
  };

  const exportCsv = async () => {
    try {
      await writeAndShare(`sorted-${localDay()}.csv`, toCSV(tasks));
      setMessage('Your export is ready. Keep it somewhere safe.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Export could not finish.');
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Your space, your rhythm.</Text>
      <Text style={styles.body}>Weekend review: {settings.weekend}. Hours {settings.workStart}–{settings.workEnd}.</Text>
      <Text style={styles.note}>{offlineStatusLabel(online)}. Schema {schemaVersion}. Last opened {lastOpenedAt ? new Date(lastOpenedAt).toLocaleString() : 'this session'}.</Text>
      <Text style={styles.note}>There is no cloud backup. Export is your copy. App updates keep this SQLite file.</Text>
      <Text style={styles.note}>{aiRequiresNetworkMessage()}</Text>
      <Text style={styles.note}>{voiceLanguages} Microphone access is requested only when you tap Speak.</Text>
      <Pressable style={styles.primary} onPress={() => void exportJson()} accessibilityLabel="Export all data as JSON">
        <Text style={styles.primaryText}>Export all data · JSON</Text>
      </Pressable>
      <Pressable onPress={() => void exportCsv()} accessibilityLabel="Export tasks as CSV">
        <Text style={styles.link}>Export tasks · CSV</Text>
      </Pressable>
      {message ? <Text style={styles.note}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.ink, marginBottom: space.s },
  note: { color: colors.muted, marginBottom: space.l, marginTop: space.m },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: colors.paper, fontWeight: '600' },
  link: { color: colors.accent, marginTop: space.m, textAlign: 'center' },
});
