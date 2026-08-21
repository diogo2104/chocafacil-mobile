import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ChickenDetail } from '../types/models';
import { colors, radii } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { FormField } from '../components/FormField';
import { AmberButton, SecondaryButton } from '../components/Buttons';
import { addDaysISO, formatDateBR, maskDateBR, parseDateBR, todayISO } from '../utils/date';

interface Props {
  chicken: ChickenDetail;
  onBack: () => void;
  onConfirm: (eggs: number, startDate: string) => Promise<void>;
}

export function StartHatchingScreen({ chicken, onBack, onConfirm }: Props) {
  const [eggs, setEggs] = useState('');
  const [startDateText, setStartDateText] = useState(formatDateBR(todayISO()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const startDateISO = useMemo(() => parseDateBR(startDateText), [startDateText]);
  const expectedDate = startDateISO ? addDaysISO(startDateISO, 21) : null;

  function validate(): { eggs: number; startDate: string } | null {
    const next: Record<string, string> = {};
    const eggCount = Number(eggs);
    if (!Number.isInteger(eggCount) || eggCount <= 0) next.eggs = 'Informe uma quantidade de ovos maior que zero.';
    if (!startDateISO) next.startDate = 'Informe uma data válida no formato DD/MM/AAAA.';
    if (startDateISO && startDateISO > todayISO()) next.startDate = 'A data de início não pode estar no futuro.';
    setErrors(next);
    if (Object.keys(next).length > 0 || !startDateISO) return null;
    return { eggs: eggCount, startDate: startDateISO };
  }

  async function handleConfirm() {
    const valid = validate();
    if (!valid) return;
    setSaving(true);
    try {
      await onConfirm(valid.eggs, valid.startDate);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Iniciar Chocagem" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.chickenBox}>
            <Text style={styles.chickenEmoji}>🥚</Text>
            <View>
              <Text style={styles.caption}>Nova chocagem para</Text>
              <Text style={styles.chickenName}>{chicken.name}</Text>
            </View>
          </View>

          <FormField label="Quantidade de ovos" required error={errors.eggs}>
            <TextInput
              value={eggs}
              onChangeText={(value) => setEggs(value.replace(/\D/g, '').slice(0, 3))}
              placeholder="Ex.: 12"
              placeholderTextColor="#9AA39D"
              keyboardType="number-pad"
              style={[styles.input, styles.bigInput, errors.eggs && styles.inputError]}
              maxLength={3}
            />
          </FormField>

          <FormField label="Quando ela começou a chocar?" required error={errors.startDate}>
            <TextInput
              value={startDateText}
              onChangeText={(value) => setStartDateText(maskDateBR(value))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9AA39D"
              keyboardType="number-pad"
              style={[styles.input, errors.startDate && styles.inputError]}
              maxLength={10}
            />
            <SecondaryButton
              title="Usar a data de hoje"
              onPress={() => {
                setStartDateText(formatDateBR(todayISO()));
                setErrors((prev) => ({ ...prev, startDate: '' }));
              }}
            />
          </FormField>

          {expectedDate ? (
            <View style={styles.expectedBox}>
              <Text style={styles.expectedEmoji}>🐣</Text>
              <Text style={styles.expectedCaption}>Previsão de nascimento</Text>
              <Text style={styles.expectedDate}>{formatDateBR(expectedDate)}</Text>
              <Text style={styles.expectedNote}>21 dias após o início da chocagem</Text>
            </View>
          ) : null}

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>🔔 Ao confirmar, o app tentará agendar os avisos locais para o dia previsto, a cada 2 horas.</Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <AmberButton title={saving ? 'Salvando...' : 'Confirmar Chocagem'} onPress={handleConfirm} disabled={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 18, gap: 20, paddingBottom: 24 },
  chickenBox: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.xl, padding: 16, borderWidth: 1, borderColor: colors.border },
  chickenEmoji: { fontSize: 36 },
  caption: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  chickenName: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  input: { minHeight: 54, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: 15, color: colors.text, fontSize: 16, fontWeight: '700' },
  bigInput: { textAlign: 'center', fontSize: 30, fontWeight: '900', minHeight: 68 },
  inputError: { borderColor: colors.red, backgroundColor: '#FFF9F9' },
  expectedBox: { alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: radii.xl, padding: 20, borderWidth: 1.5, borderColor: '#F2CD71' },
  expectedEmoji: { fontSize: 34 },
  expectedCaption: { color: colors.amberDark, fontSize: 12, fontWeight: '800', marginTop: 6 },
  expectedDate: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 3 },
  expectedNote: { color: colors.amberDark, fontSize: 11, fontWeight: '600', marginTop: 4 },
  noteBox: { backgroundColor: '#EEF2EF', borderRadius: radii.md, padding: 13 },
  noteText: { color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  footer: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
