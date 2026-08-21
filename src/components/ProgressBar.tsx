import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, percentage))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 9,
    borderRadius: 99,
    backgroundColor: '#FCE9BA',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: colors.amber,
  },
});
