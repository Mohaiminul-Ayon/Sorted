import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, space } from '../../ui/theme';
import { useApp } from '../../shell/AppContext';
import { TASK_STATES, ENERGIES, type Energy, type TaskState } from '../../domain/types';
import { inheritMeetingProject } from '../../domain/project';

const ENERGY_HELP =
  'High focus asks for a protected block. Medium is ordinary work. Low is light movement or admin. Protect sleep and meals before you pile on High tasks.';

export function TaskSheet() {
  const { editingTask, closeTask, placeTask, saveTask, projects, meetings, addTaskToCalendar } = useApp();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState('30');
  const [energy, setEnergy] = useState<Energy>('Medium');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingTask) return;
    setTitle(editingTask.title);
    setStart(editingTask.start ?? '');
    setDuration(String(editingTask.duration ?? 30));
    setEnergy(editingTask.energy ?? 'Medium');
    setNote(editingTask.prerequisiteNote ?? '');
    setProjectId(editingTask.projectId);
    setMeetingId(editingTask.meetingId);
    setReason('');
    setError('');
  }, [editingTask]);

  if (!editingTask) return null;

  const fields = () => {
    const meeting = meetings.find((item) => item.id === meetingId) ?? null;
    return inheritMeetingProject(
      {
        ...editingTask,
        title,
        start: start || null,
        duration: Number(duration) || null,
        energy,
        prerequisiteNote: note.trim() || null,
        projectId,
        meetingId,
      },
      meeting,
    );
  };

  const place = async (state: TaskState) => {
    setBusy(true);
    setError('');
    try {
      await placeTask(fields(), state, { reason: reason.trim() || undefined });
      if (state !== 'Schedule now') closeTask();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place this yet.');
    } finally {
      setBusy(false);
    }
  };

  const calendar = async () => {
    setBusy(true);
    setError('');
    try {
      const scheduled = editingTask.state === 'Schedule now' ? fields() : await placeTask(fields(), 'Schedule now');
      await addTaskToCalendar(scheduled);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calendar could not be updated.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    await saveTask({ ...editingTask, deleted: true, updatedAt: new Date().toISOString() });
    closeTask();
  };

  const activeProjects = projects.filter((project) => !project.deleted && project.status === 'Active');

  return (
    <Modal visible animationType="slide" transparent onRequestClose={closeTask}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.kicker}>{editingTask.source}</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.title} accessibilityLabel="Task title" />
            {editingTask.originalText ? <Text style={styles.original}>{editingTask.originalText}</Text> : null}
            <Text style={styles.label}>Place it</Text>
            <View style={styles.row}>
              {TASK_STATES.map((state) => (
                <Pressable key={state} onPress={() => void place(state)} style={[styles.chip, editingTask.state === state && styles.chipOn]} disabled={busy}>
                  <Text style={[styles.chipText, editingTask.state === state && styles.chipTextOn]}>{state}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Schedule now needs a start, duration, and energy</Text>
            <TextInput value={start} onChangeText={setStart} placeholder="2026-11-25T15:00" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Start date and time" />
            <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" style={styles.input} accessibilityLabel="Duration in minutes" />
            <View style={styles.row}>
              {ENERGIES.map((level) => (
                <Pressable key={level} onPress={() => setEnergy(level)} style={[styles.chip, energy === level && styles.chipOn]}>
                  <Text style={[styles.chipText, energy === level && styles.chipTextOn]}>{level}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setHelp((value) => !value)} accessibilityLabel="Energy guidance">
              <Text style={styles.link}>What do energy levels mean?</Text>
            </Pressable>
            {help ? <Text style={styles.original}>{ENERGY_HELP}</Text> : null}
            <TextInput value={note} onChangeText={setNote} placeholder="Optional prerequisite note" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Prerequisite note" />
            <TextInput value={reason} onChangeText={setReason} placeholder="Reason if you move a scheduled time" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Reschedule reason" />
            <Text style={styles.label}>Project</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setProjectId(null)} style={[styles.chip, !projectId && styles.chipOn]}>
                <Text style={[styles.chipText, !projectId && styles.chipTextOn]}>None</Text>
              </Pressable>
              {activeProjects.map((project) => (
                <Pressable key={project.id} onPress={() => setProjectId(project.id)} style={[styles.chip, projectId === project.id && styles.chipOn]}>
                  <Text style={[styles.chipText, projectId === project.id && styles.chipTextOn]}>{project.name}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Meeting</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setMeetingId(null)} style={[styles.chip, !meetingId && styles.chipOn]}>
                <Text style={[styles.chipText, !meetingId && styles.chipTextOn]}>None</Text>
              </Pressable>
              {meetings.filter((meeting) => !meeting.deleted).map((meeting) => (
                <Pressable key={meeting.id} onPress={() => setMeetingId(meeting.id)} style={[styles.chip, meetingId === meeting.id && styles.chipOn]}>
                  <Text style={[styles.chipText, meetingId === meeting.id && styles.chipTextOn]}>{meeting.title}</Text>
                </Pressable>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={styles.primary} onPress={() => void calendar()} disabled={busy} accessibilityLabel="Add to device calendar">
              <Text style={styles.primaryText}>{editingTask.calendarEventId ? 'Update calendar event' : 'Add to device calendar'}</Text>
            </Pressable>
            <Pressable onPress={() => void remove()} accessibilityLabel="Remove this task">
              <Text style={styles.cancel}>Remove from your plan</Text>
            </Pressable>
            <Pressable onPress={closeTask} accessibilityLabel="Close task">
              <Text style={styles.cancel}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,58,76,0.25)' },
  sheet: { backgroundColor: colors.paper, padding: space.l, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  kicker: { color: colors.accent, marginBottom: space.s },
  title: { fontSize: 22, color: colors.ink, fontWeight: '600', marginBottom: space.s },
  original: { color: colors.muted, marginBottom: space.m, lineHeight: 20 },
  label: { color: colors.ink, marginTop: space.s, marginBottom: space.s, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.s },
  chip: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, backgroundColor: colors.bg },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.ink, fontSize: 13 },
  chipTextOn: { color: colors.paper },
  input: { borderWidth: 1, borderColor: colors.calm, borderRadius: 12, padding: space.m, color: colors.ink, marginBottom: space.s },
  error: { color: '#8A4A4A', marginBottom: space.s },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center', marginTop: space.s },
  primaryText: { color: colors.paper, fontWeight: '600' },
  link: { color: colors.accent, marginBottom: space.s },
  cancel: { textAlign: 'center', color: colors.muted, marginTop: space.m },
});
