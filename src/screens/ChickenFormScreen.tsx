import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { BreedCode, ChickenDetail, ChickenFormData } from '../types/models';
import { colors, radii } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { FormField } from '../components/FormField';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { BREED_OPTIONS, breedLabel } from '../utils/labels';
import { choosePhotoFromLibrary, takePhoto } from '../services/imageService';

interface Props {
  initial?: ChickenDetail;
  onSave: (data: ChickenFormData) => Promise<void>;
  onCancel: () => void;
}

export function ChickenFormScreen({ initial, onSave, onCancel }: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [breed, setBreed] = useState<BreedCode | null>(initial?.breed ?? null);
  const [customBreed, setCustomBreed] = useState(initial?.customBreed ?? '');
  const [fatherName, setFatherName] = useState(initial?.fatherName ?? '');
  const [motherName, setMotherName] = useState(initial?.motherName ?? '');
  const [imageUri, setImageUri] = useState<string | null>(initial?.imageUri ?? null);
  const [imageChanged, setImageChanged] = useState(false);
  const [breedModal, setBreedModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const breedText = useMemo(() => (breed ? breedLabel(breed, customBreed || null) : 'Selecione a raça'), [breed, customBreed]);

  function openPhotoOptions() {
    Alert.alert('Foto da galinha', 'Escolha uma opção', [
      {
        text: 'Tirar foto',
        onPress: async () => {
          try {
            const uri = await takePhoto();
            if (uri) {
              setImageUri(uri);
              setImageChanged(true);
            }
          } catch (error) {
            Alert.alert('Câmera', error instanceof Error ? error.message : 'Não foi possível usar a câmera.');
          }
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          try {
            const uri = await choosePhotoFromLibrary();
            if (uri) {
              setImageUri(uri);
              setImageChanged(true);
            }
          } catch {
            Alert.alert('Foto', 'Não foi possível selecionar a foto.');
          }
        },
      },
      ...(imageUri
        ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: () => { setImageUri(null); setImageChanged(true); } }]
        : []),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Informe o nome da galinha.';
    if (!breed) next.breed = 'Selecione uma raça.';
    if (breed === 'OUTRA' && !customBreed.trim()) next.customBreed = 'Informe a raça.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate() || !breed) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        breed,
        customBreed: breed === 'OUTRA' ? customBreed.trim() : null,
        fatherName: fatherName.trim() || null,
        motherName: motherName.trim() || null,
        imageUri,
        imageChanged: isEdit ? imageChanged : Boolean(imageUri),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={isEdit ? 'Editar Galinha' : 'Cadastrar Galinha'} onBack={onCancel} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <Pressable onPress={openPhotoOptions} style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photo} />
              ) : (
                <>
                  <Text style={styles.photoEmoji}>📷</Text>
                  <Text style={styles.photoText}>Adicionar foto</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.optionalText}>Foto opcional</Text>
            {imageUri ? <Text style={styles.changePhoto}>Toque na foto para alterar</Text> : null}
          </View>

          <FormField label="Nome da galinha" required error={errors.name}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Mimosa"
              placeholderTextColor="#9AA39D"
              style={[styles.input, errors.name && styles.inputError]}
              autoCapitalize="words"
              maxLength={80}
            />
          </FormField>

          <FormField label="Raça" required error={errors.breed}>
            <Pressable onPress={() => setBreedModal(true)} style={[styles.input, styles.select, errors.breed && styles.inputError]}>
              <Text style={[styles.selectText, !breed && styles.placeholder]}>{breedText}</Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </Pressable>
          </FormField>

          {breed === 'OUTRA' ? (
            <FormField label="Qual a raça?" required error={errors.customBreed}>
              <TextInput
                value={customBreed}
                onChangeText={setCustomBreed}
                placeholder="Digite a raça"
                placeholderTextColor="#9AA39D"
                style={[styles.input, errors.customBreed && styles.inputError]}
                autoCapitalize="words"
                maxLength={80}
              />
            </FormField>
          ) : null}

          <FormField label="Nome do pai" optional>
            <TextInput
              value={fatherName}
              onChangeText={setFatherName}
              placeholder="Ex.: Galo Preto"
              placeholderTextColor="#9AA39D"
              style={styles.input}
              autoCapitalize="words"
              maxLength={80}
            />
          </FormField>

          <FormField label="Nome da mãe" optional>
            <TextInput
              value={motherName}
              onChangeText={setMotherName}
              placeholder="Ex.: Pintada"
              placeholderTextColor="#9AA39D"
              style={styles.input}
              autoCapitalize="words"
              maxLength={80}
            />
          </FormField>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton title={saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar Galinha'} onPress={handleSave} disabled={saving} />
          <SecondaryButton title="Cancelar" onPress={onCancel} disabled={saving} />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={breedModal} transparent animationType="fade" onRequestClose={() => setBreedModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBreedModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Selecione a raça</Text>
            {BREED_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setBreed(option.value);
                  setBreedModal(false);
                  setErrors((prev) => ({ ...prev, breed: '' }));
                }}
                style={({ pressed }) => [styles.breedOption, pressed && styles.pressed]}
              >
                <Text style={styles.breedOptionText}>{option.label}</Text>
                {breed === option.value ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 18, gap: 18, paddingBottom: 26 },
  photoSection: { alignItems: 'center', marginTop: 2, marginBottom: 2 },
  photoButton: {
    width: 112,
    height: 112,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C9D2CB',
    backgroundColor: '#EEF2EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoEmoji: { fontSize: 34 },
  photoText: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 5 },
  optionalText: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 8 },
  changePhoto: { color: colors.green, fontSize: 11, fontWeight: '700', marginTop: 2 },
  input: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: { borderColor: colors.red, backgroundColor: '#FFF9F9' },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  placeholder: { color: '#9AA39D', fontWeight: '500' },
  selectArrow: { color: colors.muted, fontSize: 22, marginTop: -4 },
  footer: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18, gap: 10, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modalCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radii.xl, padding: 18 },
  modalTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: 8 },
  breedOption: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  breedOptionText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  check: { color: colors.green, fontSize: 20, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
