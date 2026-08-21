import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐔</Text>
      <Text style={styles.title}>ChocaFácil</Text>
      <Text style={styles.subtitle}>Controle simples das suas galinhas</Text>
      <Text style={styles.offline}>100% offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green },
  emoji: { fontSize: 84 },
  title: { color: '#FFF', fontSize: 39, fontWeight: '900', marginTop: 12 },
  subtitle: { color: '#DCEFE1', fontSize: 15, fontWeight: '600', marginTop: 5 },
  offline: { color: '#FFF', fontSize: 11, fontWeight: '800', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
});
