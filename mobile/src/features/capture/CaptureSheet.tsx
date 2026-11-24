import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, space } from '../../ui/theme';
import { useApp } from '../../app/AppContext';

export function CaptureSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { captureInbox } = useApp();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await captureInbox(title);
      setTitle('');
      setError('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss capture" />
        <View style={styles.sheet}>
          <Text style={styles.title}>What’s on your mind?</Text>
          <Text style={styles.hint}>A title is enough. It lands in Inbox — you sort it later.</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Capture a thought"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            editable={!saving}
            accessibilityLabel="Task title"
            onSubmitEditing={() => void save()}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.primary, saving && styles.disabled]} onPress={() => void save()} disabled={saving}>
            <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save to Inbox'}</Text>
          </Pressable>
          <Pressable onPress={onClose} accessibilityLabel="Close capture" disabled={saving}>
            <Text style={styles.cancel}>Not now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,58,76,0.25)' },
  sheet: { backgroundColor: colors.paper, padding: space.l, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 22, color: colors.ink, fontWeight: '600' },
  hint: { color: colors.muted, marginVertical: space.s },
  input: { borderWidth: 1, borderColor: colors.calm, borderRadius: 12, padding: space.m, fontSize: 16, color: colors.ink, marginBottom: space.m },
  error: { color: '#8A4A4A', marginBottom: space.s },
  primary: { backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.paper, fontWeight: '600' },
  cancel: { textAlign: 'center', color: colors.muted, marginTop: space.m },
});
