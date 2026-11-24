import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, space } from '../../ui/theme';
import { useApp } from '../../shell/AppContext';
import { inboxTitlesFromCapture } from '../../domain/capture';
import { useVoiceCapture } from './useVoiceCapture';

export function CaptureSheet() {
  const { captureOpen, pendingCapture, closeCapture, captureDraft } = useApp();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState(pendingCapture?.source ?? 'typed');
  const [sourceApp, setSourceApp] = useState<string | null>(pendingCapture?.sourceApp ?? null);
  const [originalText, setOriginalText] = useState(pendingCapture?.text ?? '');

  const voice = useVoiceCapture((text) => {
    setTitle(text);
    setOriginalText(text);
    setSource('voice');
  });

  useEffect(() => {
    if (!captureOpen) return;
    const text = pendingCapture?.text ?? '';
    setTitle(text);
    setOriginalText(text);
    setSource(pendingCapture?.source ?? 'typed');
    setSourceApp(pendingCapture?.sourceApp ?? null);
    setError('');
  }, [captureOpen, pendingCapture]);

  const dismiss = () => {
    if (voice.listening) voice.cancel();
    closeCapture();
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await captureDraft({
        text: title,
        source,
        sourceApp,
        originalText: originalText.trim() || title.trim(),
      });
      setTitle('');
      setError('');
      closeCapture();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const extraCount = inboxTitlesFromCapture(title).length;

  return (
    <Modal visible={captureOpen} animationType="slide" transparent onRequestClose={dismiss}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityLabel="Dismiss capture" />
        <View style={styles.sheet}>
          <Text style={styles.title}>What’s on your mind?</Text>
          <Text style={styles.hint}>
            A title is enough. Voice and shares stay editable, then land in Inbox.
            {voice.locale ? ` Voice language: ${voice.locale}.` : ''}
          </Text>
          <TextInput
            value={title}
            onChangeText={(next) => {
              setTitle(next);
              if (source === 'typed') setOriginalText(next);
            }}
            placeholder="Capture a thought"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus={!pendingCapture?.text}
            editable={!saving && !voice.listening}
            multiline
            accessibilityLabel="Task title"
            onSubmitEditing={() => void save()}
          />
          {extraCount > 1 ? (
            <Text style={styles.hint}>Each line becomes its own Inbox item. The full text is kept on every one.</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {voice.status ? <Text style={styles.error}>{voice.status}</Text> : null}
          <View style={styles.row}>
            {voice.listening ? (
              <Pressable style={styles.secondary} onPress={voice.cancel} accessibilityLabel="Cancel voice capture">
                <Text style={styles.secondaryText}>Cancel listening</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.secondary}
                onPress={() => void voice.start()}
                disabled={saving}
                accessibilityLabel="Capture with voice"
              >
                <Text style={styles.secondaryText}>Speak</Text>
              </Pressable>
            )}
            <Pressable style={[styles.primary, saving && styles.disabled]} onPress={() => void save()} disabled={saving || voice.listening}>
              <Text style={styles.primaryText}>{saving ? 'Saving…' : extraCount > 1 ? `Save ${extraCount} to Inbox` : 'Save to Inbox'}</Text>
            </Pressable>
          </View>
          <Pressable onPress={dismiss} accessibilityLabel="Close capture" disabled={saving}>
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
  input: {
    borderWidth: 1,
    borderColor: colors.calm,
    borderRadius: 12,
    padding: space.m,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.m,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: { color: '#8A4A4A', marginBottom: space.s },
  row: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
  primary: { flex: 1, backgroundColor: colors.accent, padding: space.m, borderRadius: 14, alignItems: 'center' },
  secondary: { padding: space.m, borderRadius: 14, borderWidth: 1, borderColor: colors.calm },
  secondaryText: { color: colors.ink, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.paper, fontWeight: '600' },
  cancel: { textAlign: 'center', color: colors.muted, marginTop: space.m },
});
