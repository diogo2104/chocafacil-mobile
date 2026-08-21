import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii } from '../theme';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ScreenHeader } from '../components/ScreenHeader';

interface Props {
  chickenName: string;
  eggs: number;
  onBack: () => void;
  onFinalize: (chicks: number | null) => Promise<void>;
}

export function RegisterChicksScreen({ chickenName, eggs, onBack, onFinalize }: Props) {
  const [chicks, setChicks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function finish(skip: boolean) {
    let count: number | null = null;
    if (!skip && chicks.trim()) {
      count = Number(chicks);
      if (!Number.isInteger(count) || count < 0 || count > eggs) {
        setError(`Informe um valor entre 0 e ${eggs}.`);
        return;
      }
    }
    setSaving(true);
    try {
      await onFinalize(count);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Encerrar Chocagem" onBack={onBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.center}>
            <Text style={styles.emoji}>🐣</Text>
            <Text style={styles.title}>Como foi a chocagem?</Text>
            <Text style={styles.subtitle}>{chickenName} · 🥚 {eggs} ovos</Text>
          </View>

          <View>
            <Text style={styles.label}>Quantos pintinhos nasceram? <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput
              value={chicks}
              onChangeText={(value) => { setChicks(value.replace(/\D/g, '').slice(0, 3)); setError(''); }}
              placeholder="Ex.: 10"
              placeholderTextColor="#9AA39D"
              keyboardType="number-pad"
              style={[styles.input, error ? styles.inputError : null]}
              maxLength={3}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton title={saving ? 'Salvando...' : 'Finalizar'} onPress={() => void finish(false)} disabled={saving} />
          <SecondaryButton title="Finalizar sem informar pintinhos" onPress={() => void finish(true)} disabled={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 22, gap: 30 },
  center: { alignItems: 'center' },
  emoji: { fontSize: 68 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: 6 },
  label: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  optional: { color: colors.muted, fontWeight: '500', fontSize: 12 },
  input: { minHeight: 72, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, paddingHorizontal: 15, color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  inputError: { borderColor: colors.red, backgroundColor: '#FFF9F9' },
  error: { color: colors.red, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  footer: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18, gap: 10, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
