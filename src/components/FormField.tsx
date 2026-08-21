import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, optional, error, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.required}>*</Text> : null}
        {optional ? <Text style={styles.optional}>(opcional)</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { color: colors.text, fontSize: 14, fontWeight: '800' },
  required: { color: colors.red, fontWeight: '900' },
  optional: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  error: { color: colors.red, fontSize: 12, fontWeight: '700' },
});
