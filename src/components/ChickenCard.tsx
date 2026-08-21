import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Chicken } from '../types/models';
import { colors, radii } from '../theme';
import { formatDateBR, hatchingProgress } from '../utils/date';
import { ChickenAvatar } from './ChickenAvatar';
import { ProgressBar } from './ProgressBar';
import { breedLabel } from '../utils/labels';

export function ChickenCard({ chicken, onPress }: { chicken: Chicken; onPress: () => void }) {
  const hatching = chicken.activeHatching;
  const progress = hatching ? hatchingProgress(hatching.startDate, hatching.expectedDate) : null;

  if (hatching && progress?.dueToday) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${chicken.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, styles.dueCard, pressed && styles.pressed]}
      >
        <ChickenAvatar uri={chicken.imageUri} hatching />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{chicken.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <Text style={styles.breed}>{breedLabel(chicken.breed, chicken.customBreed)}</Text>
          <View style={styles.dueBadge}><Text style={styles.dueBadgeText}>🐣 HOJE É O DIA!</Text></View>
          <Text style={styles.amberInfo}>🥚 {hatching.eggs} ovos · previsão para hoje</Text>
        </View>
      </Pressable>
    );
  }

  if (hatching) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${chicken.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, styles.hatchingCard, pressed && styles.pressed]}
      >
        <ChickenAvatar uri={chicken.imageUri} hatching />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{chicken.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <Text style={styles.breed}>{breedLabel(chicken.breed, chicken.customBreed)}</Text>
          <View style={styles.statusRow}>
            <View style={styles.hatchingBadge}><Text style={styles.hatchingBadgeText}>🟠 CHOCANDO</Text></View>
            <Text style={styles.amberInfo}>🥚 {hatching.eggs} ovos</Text>
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressText}>Dia {progress?.elapsed ?? 0} de 21</Text>
            <Text style={styles.progressText}>
              {progress?.overdue
                ? 'Previsão vencida'
                : `Falta${progress?.remaining === 1 ? '' : 'm'} ${progress?.remaining ?? 0} dia${progress?.remaining === 1 ? '' : 's'}`}
            </Text>
          </View>
          <ProgressBar percentage={progress?.percentage ?? 0} />
          <Text style={styles.expected}>Previsão: {formatDateBR(hatching.expectedDate)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${chicken.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ChickenAvatar uri={chicken.imageUri} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{chicken.name}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
        <Text style={styles.breed}>{breedLabel(chicken.breed, chicken.customBreed)}</Text>
        <View style={styles.normalBadge}><Text style={styles.normalBadgeText}>● Normal</Text></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  hatchingCard: { borderColor: '#F3CF78', borderWidth: 1.5 },
  dueCard: { backgroundColor: '#FFF4D8', borderColor: colors.amber, borderWidth: 1.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
  content: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: 17, fontWeight: '900', flex: 1 },
  chevron: { color: '#9AA39D', fontSize: 22, fontWeight: '700' },
  breed: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 1 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 7 },
  normalBadge: { alignSelf: 'flex-start', backgroundColor: colors.greenSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginTop: 7 },
  normalBadgeText: { color: colors.greenDark, fontSize: 12, fontWeight: '800' },
  hatchingBadge: { backgroundColor: colors.amberSoft, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4 },
  hatchingBadgeText: { color: colors.amberDark, fontSize: 11, fontWeight: '900' },
  dueBadge: { alignSelf: 'flex-start', backgroundColor: colors.amber, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, marginTop: 6 },
  dueBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  amberInfo: { color: colors.amberDark, fontSize: 12, fontWeight: '800' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 10, marginBottom: 5 },
  progressText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  expected: { color: '#8E9891', fontSize: 11, fontWeight: '600', marginTop: 5 },
});
