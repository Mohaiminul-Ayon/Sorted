import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../app/AppContext';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';

export function ProjectsScreen() {
  const { projects, meetings, tasks } = useApp();
  const active = projects.filter((p) => !p.deleted);

  return (
    <Screen>
      <Text style={styles.title}>Good things take shape.</Text>
      <ScrollView>
        {active.length === 0 ? <Text style={styles.muted}>Projects will live here. Create them in a later step.</Text> : null}
        {active.map((p) => {
          const linked = tasks.filter((t) => !t.deleted && t.projectId === p.id);
          const done = linked.filter((t) => t.state === 'Done').length;
          return (
            <View key={p.id} style={styles.card}>
              <Text style={styles.pill}>{p.context}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.muted}>{done} of {linked.length} steps taken</Text>
            </View>
          );
        })}
        <Text style={styles.section}>Meetings</Text>
        {meetings.filter((m) => !m.deleted).map((m) => (
          <Text key={m.id} style={styles.row}>{m.title}</Text>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.l },
  muted: { color: colors.muted },
  card: { backgroundColor: colors.paper, padding: space.m, borderRadius: 16, marginBottom: space.m },
  pill: { color: colors.accent, fontSize: 12, marginBottom: 6 },
  name: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  section: { marginTop: space.l, fontSize: 18, color: colors.ink, fontWeight: '600' },
  row: { color: colors.ink, paddingVertical: 8 },
});
