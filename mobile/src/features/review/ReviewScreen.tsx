import { StyleSheet, Text } from 'react-native';
import { useApp } from '../../app/AppContext';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';

export function ReviewScreen() {
  const { settings, tasks } = useApp();
  const important = tasks.filter((t) => !t.deleted && t.state === 'Important').length;
  const someday = tasks.filter((t) => !t.deleted && t.state === 'Someday').length;

  return (
    <Screen>
      <Text style={styles.title}>A fresh perspective.</Text>
      <Text style={styles.body}>Weekly review on {settings.weekend}s, up to 15 minutes. Timed sessions arrive in a later PR.</Text>
      <Text style={styles.stat}>{important} important · {someday} someday</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.muted, lineHeight: 22 },
  stat: { marginTop: space.l, color: colors.ink },
});
