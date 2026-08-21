import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

interface Props {
  uri: string | null;
  size?: number;
  hatching?: boolean;
}

export function ChickenAvatar({ uri, size = 64, hatching = false }: Props) {
  const radius = Math.round(size * 0.28);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.greenSoft }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: hatching ? colors.amberSoft : colors.greenSoft,
        },
      ]}
    >
      <Text style={{ fontSize: Math.round(size * 0.52) }}>🐔</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
});
