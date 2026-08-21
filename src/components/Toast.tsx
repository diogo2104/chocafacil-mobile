import { StyleSheet, Text, View } from 'react-native';

export function Toast({ message }: { message: string }) {
  return (
    <View pointerEvents="none" style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
    backgroundColor: '#172019',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  text: { color: '#FFF', fontSize: 14, fontWeight: '800', textAlign: 'center' },
});
