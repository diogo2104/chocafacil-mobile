import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ChickenDetail } from '../types/models';
import { colors, radii } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { ChickenAvatar } from '../components/ChickenAvatar';
import { AmberButton, DangerButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ProgressBar } from '../components/ProgressBar';
import { breedLabel } from '../utils/labels';
import { formatDateBR, hatchingProgress } from '../utils/date';

interface Props {
  chicken: ChickenDetail;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartHatching: () => void;
  onFinishHatching: () => void;
  onCancelHatching: () => void;
  onReactivateNotifications: () => Promise<void>;
}

export function ChickenDetailScreen({
  chicken,
  onBack,
  onEdit,
  onDelete,
  onStartHatching,
  onFinishHatching,
  onCancelHatching,
  onReactivateNotifications,
}: Props) {
  const hatching = chicken.activeHatching;
  const progress = hatching ? hatchingProgress(hatching.startDate, hatching.expectedDate) : null;

  function confirmDelete() {
    Alert.alert(
      'Excluir galinha?',
      `Tem certeza que deseja excluir ${chicken.name}? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: onDelete },
      ],
    );
  }

  function confirmCancelHatching() {
    Alert.alert(
      'Cancelar chocagem?',
      `Deseja retirar ${chicken.name} do modo de chocagem sem registrar pintinhos? As notificações serão canceladas.`,
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar chocagem', style: 'destructive', onPress: onCancelHatching },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Detalhes" onBack={onBack} rightLabel="Editar" onRightPress={onEdit} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <ChickenAvatar uri={chicken.imageUri} size={118} hatching={Boolean(hatching)} />
          <Text style={styles.name}>{chicken.name}</Text>
          <View style={styles.breedBadge}>
            <Text style={styles.breedBadgeText}>{breedLabel(chicken.breed, chicken.customBreed)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <InfoRow label="Raça" value={breedLabel(chicken.breed, chicken.customBreed)} />
          <Divider />
          <InfoRow label="Pai" value={chicken.fatherName || 'Não informado'} />
          <Divider />
          <InfoRow label="Mãe" value={chicken.motherName || 'Não informado'} />
        </View>

        {!hatching ? (
          <View style={styles.card}>
            <View style={styles.normalStatus}>
              <Text style={styles.statusEmoji}>🟢</Text>
              <View style={styles.flex}>
                <Text style={styles.statusTitle}>Não está chocando</Text>
                <Text style={styles.statusText}>Quando ela começar, registre os ovos e a data.</Text>
              </View>
            </View>
            <AmberButton title="🥚 Iniciar Chocagem" onPress={onStartHatching} />
          </View>
        ) : (
          <View style={[styles.card, styles.hatchingCard]}>
            <View style={styles.hatchingHeader}>
              <View style={styles.hatchingBadge}><Text style={styles.hatchingBadgeText}>🟠 CHOCANDO</Text></View>
              {progress?.dueToday ? <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>🐣 HOJE É O DIA</Text></View> : null}
            </View>

            <View style={styles.metricRow}>
              <Metric emoji="🥚" value={String(hatching.eggs)} label="ovos" />
              <Metric emoji="📅" value={formatDateBR(hatching.startDate)} label="início" small />
              <Metric emoji="🐣" value={formatDateBR(hatching.expectedDate)} label="previsão" small />
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Dia {progress?.elapsed ?? 0} de 21</Text>
              <Text style={styles.progressLabel}>
                {progress?.overdue
                  ? 'Previsão vencida'
                  : progress?.dueToday
                    ? 'Nascimento previsto hoje!'
                    : `Falta${progress?.remaining === 1 ? '' : 'm'} ${progress?.remaining ?? 0} dia${progress?.remaining === 1 ? '' : 's'}`}
              </Text>
            </View>
            <ProgressBar percentage={progress?.percentage ?? 0} />

            <Text style={styles.notificationNote}>
              🔔 No dia previsto, o app agenda avisos locais a cada 2 horas no Android.
            </Text>

            <PrimaryButton title="🐣 Encerrar e registrar pintinhos" onPress={onFinishHatching} />
            <SecondaryButton title="🔔 Reativar notificações" onPress={() => void onReactivateNotifications()} />
            <Pressable onPress={confirmCancelHatching} style={({ pressed }) => [styles.cancelLink, pressed && { opacity: 0.6 }]}>
              <Text style={styles.cancelLinkText}>Cancelar modo de chocagem</Text>
            </Pressable>
          </View>
        )}

        {chicken.history.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de Chocagens</Text>
            {chicken.history.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <Divider /> : null}
                <View style={styles.historyItem}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyTitle}>Chocagem {chicken.history.length - index}</Text>
                    <Text style={styles.historyStatus}>Finalizada</Text>
                  </View>
                  <Text style={styles.historyDates}>{formatDateBR(item.startDate)} → {formatDateBR(item.expectedDate)}</Text>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyStat}>🥚 {item.eggs} ovos</Text>
                    <Text style={styles.historyStat}>🐣 {item.chicks ?? '—'} pintinhos</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <DangerButton title="Excluir galinha" onPress={confirmDelete} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Metric({ emoji, value, label, small }: { emoji: string; value: string; label: string; small?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricEmoji}>{emoji}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.metricValue, small && styles.metricValueSmall]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  hero: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.xl, paddingVertical: 24 },
  name: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 13 },
  breedBadge: { backgroundColor: colors.greenSoft, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 7 },
  breedBadgeText: { color: colors.greenDark, fontSize: 13, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: 17, gap: 14, borderWidth: 1, borderColor: colors.border },
  hatchingCard: { borderColor: '#F2CC71', backgroundColor: '#FFFDFA' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  infoLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'right', flexShrink: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  normalStatus: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statusEmoji: { fontSize: 22 },
  flex: { flex: 1 },
  statusTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  statusText: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  hatchingHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hatchingBadge: { backgroundColor: colors.amberSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  hatchingBadgeText: { color: colors.amberDark, fontSize: 12, fontWeight: '900' },
  todayBadge: { backgroundColor: colors.amber, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  todayBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  metricRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, alignItems: 'center', backgroundColor: '#FFF8E8', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 5 },
  metricEmoji: { fontSize: 22 },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 3 },
  metricValueSmall: { fontSize: 13 },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  progressLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  notificationNote: { color: colors.muted, backgroundColor: '#F6F7F6', borderRadius: 14, padding: 12, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  cancelLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  cancelLinkText: { color: colors.red, fontSize: 13, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  historyItem: { gap: 5 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  historyStatus: { color: colors.greenDark, backgroundColor: colors.greenSoft, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, fontSize: 10, fontWeight: '800' },
  historyDates: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  historyStats: { flexDirection: 'row', gap: 14, marginTop: 2 },
  historyStat: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
