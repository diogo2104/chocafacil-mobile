import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';
import { PrimaryButton } from '../components/Buttons';

interface Props {
  name: string;
  eggs: number;
  chicks: number | null;
  onGoHome: () => void;
}

export function HatchingDoneScreen({ name, eggs, chicks, onGoHome }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>Chocagem encerrada</Text>
        <Text style={styles.subtitle}>O registro foi salvo no histórico.</Text>

        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.stats}>
            <Stat emoji="🥚" value={eggs} label="ovos" />
            {chicks !== null ? <Stat emoji="🐣" value={chicks} label="pintinhos" /> : null}
          </View>
        </View>

        <Text style={styles.status}>🟢 O status voltou para Normal</Text>
        <PrimaryButton title="Voltar para Minhas Galinhas" onPress={onGoHome} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 22 },
  emoji: { fontSize: 64 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 14, fontWeight: '600', marginTop: 5 },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: radii.xl, padding: 20, marginTop: 28, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 18 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 42 },
  stat: { alignItems: 'center' },
  statEmoji: { fontSize: 30 },
  statValue: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 3 },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  status: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 22 },
  button: { alignSelf: 'stretch', marginTop: 24 },
});
