import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, space } from '../../ui/theme';
import { useApp } from '../../app/AppContext';

export function CaptureSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { captureInbox } = useApp();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    try {
      await captureInbox(title);
      setTitle('');
      setError('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
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
            accessibilityLabel="Task title"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={() => void save()}>
            <Text style={styles.primaryText}>Save to Inbox</Text>
          </Pressable>
          <Pressable onPress={onClose} accessibilityLabel="Close capture">
            <Text style={styles.cancel}>Not now</Text>
          </Pressable>
        </View>
      </View>
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
  primaryText: { color: colors.paper, fontWeight: '600' },
  cancel: { textAlign: 'center', color: colors.muted, marginTop: space.m },
});
