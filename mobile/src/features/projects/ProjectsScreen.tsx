import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../../shell/AppContext';
import { colors, space } from '../../ui/theme';
import { Screen } from '../../ui/Screen';
import { CONTEXTS, archiveProject, assertUniqueProjectName, createMeeting, createProject, projectProgress, restoreProject, softDeleteProject } from '../../domain/project';
import type { Project, ProjectContext } from '../../domain/types';

export function ProjectsScreen() {
  const { projects, meetings, tasks, saveProject, saveMeeting, saveTask } = useApp();
  const [name, setName] = useState('');
  const [context, setContext] = useState<ProjectContext>('Personal');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingAt, setMeetingAt] = useState('');
  const [error, setError] = useState('');

  const active = projects.filter((p) => !p.deleted);

  const addProject = async () => {
    try {
      assertUniqueProjectName(name, projects);
      await saveProject(createProject(name, { context }));
      setName('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the project.');
    }
  };

  const addMeeting = async () => {
    try {
      await saveMeeting(createMeeting(meetingTitle, meetingAt));
      setMeetingTitle('');
      setMeetingAt('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the meeting.');
    }
  };

  const toggleArchive = async (project: Project) => {
    await saveProject(project.status === 'Archived' ? restoreProject(project) : archiveProject(project));
  };

  const remove = async (project: Project) => {
    const result = softDeleteProject(project, tasks);
    await saveProject(result.project);
    for (const task of result.tasks) {
      const previous = tasks.find((item) => item.id === task.id);
      if (previous && previous.projectId !== task.projectId) await saveTask(task);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Good things take shape.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="New project name" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="New project name" />
      <View style={styles.row}>
        {CONTEXTS.map((item) => (
          <Pressable key={item} onPress={() => setContext(item)} style={[styles.chip, context === item && styles.chipOn]} accessibilityLabel={`Project context ${item}`}>
            <Text style={[styles.chipText, context === item && styles.chipTextOn]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => void addProject()} accessibilityLabel="Save project">
        <Text style={styles.link}>Save project</Text>
      </Pressable>
      <ScrollView>
        {active.length === 0 ? <Text style={styles.muted}>Name a project to keep related steps together.</Text> : null}
        {active.map((p) => {
          const linked = tasks.filter((t) => !t.deleted && t.projectId === p.id);
          const { done, total } = projectProgress(p, tasks);
          return (
            <View key={p.id} style={styles.card}>
              <Text style={styles.pill}>{p.context} · {p.status}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.muted}>{done} of {total} steps taken (open tasks stay linked if you archive)</Text>
              <Pressable onPress={() => void toggleArchive(p)} accessibilityLabel={p.status === 'Archived' ? `Restore ${p.name}` : `Archive ${p.name}`}>
                <Text style={styles.link}>{p.status === 'Archived' ? 'Restore' : 'Archive'}</Text>
              </Pressable>
              <Pressable onPress={() => void remove(p)} accessibilityLabel={`Delete ${p.name} and unlink open tasks`}>
                <Text style={styles.muted}>Delete (unlinks open tasks; labeled default pending BRD #4)</Text>
              </Pressable>
              {linked.slice(0, 3).map((task) => (
                <Text key={task.id} style={styles.muted}>{task.title}</Text>
              ))}
            </View>
          );
        })}
        <Text style={styles.section}>Meetings</Text>
        <TextInput value={meetingTitle} onChangeText={setMeetingTitle} placeholder="Meeting title" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Meeting title" />
        <TextInput value={meetingAt} onChangeText={setMeetingAt} placeholder="2026-11-25T14:00" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Meeting start" />
        <Pressable onPress={() => void addMeeting()} accessibilityLabel="Save meeting">
          <Text style={styles.link}>Save meeting</Text>
        </Pressable>
        {meetings.filter((m) => !m.deleted).map((m) => (
          <Text key={m.id} style={styles.rowText}>{m.title} · {m.startsAt}</Text>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, color: colors.ink, fontWeight: '600', marginBottom: space.l },
  muted: { color: colors.muted, marginBottom: 8 },
  card: { backgroundColor: colors.paper, padding: space.m, borderRadius: 16, marginBottom: space.m },
  pill: { color: colors.accent, fontSize: 12, marginBottom: 6 },
  name: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  section: { marginTop: space.l, fontSize: 18, color: colors.ink, fontWeight: '600', marginBottom: space.s },
  rowText: { color: colors.ink, paddingVertical: 8 },
  input: { backgroundColor: colors.paper, borderRadius: 12, padding: space.m, color: colors.ink, marginBottom: space.s },
  row: { flexDirection: 'row', gap: 8, marginBottom: space.s },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.paper },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.paper },
  link: { color: colors.accent, marginBottom: space.m },
  error: { color: '#8A4A4A' },
});
