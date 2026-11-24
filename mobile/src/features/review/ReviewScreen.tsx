import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { colors, space } from '../../ui/theme';

export function ReviewScreen() {
  const { settings, tasks } = useApp();
  const important = tasks.filter((t) => !t.deleted && t.state === 'Important').length;
  const someday = tasks.filter((t) => !t.deleted && t.state === 'Someday').length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>A fresh perspective.</Text>
      <Text style={styles.body}>Weekly review on {settings.weekend}s, up to 15 minutes. Timed sessions arrive in a later PR.</Text>
      <Text style={styles.stat}>{important} important · {someday} someday</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: space.l },
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.m },
  body: { color: colors.muted, lineHeight: 22 },
  stat: { marginTop: space.l, color: colors.ink },
});
