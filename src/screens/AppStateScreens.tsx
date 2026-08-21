import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { PrimaryButton } from '../components/Buttons';

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loading}>Carregando seus dados...</Text>
      </View>
    </SafeAreaView>
  );
}

export function FatalErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Não foi possível abrir o aplicativo</Text>
        <Text style={styles.message}>{message}</Text>
        <PrimaryButton title="Tentar novamente" onPress={onRetry} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  loading: { color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: 12 },
  emoji: { fontSize: 54 },
  title: { color: colors.text, fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  message: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  button: { alignSelf: 'stretch', marginTop: 24 },
});
