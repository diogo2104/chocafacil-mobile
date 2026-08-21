import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Chicken } from '../types/models';
import { colors } from '../theme';
import { ChickenCard } from '../components/ChickenCard';
import { PrimaryButton } from '../components/Buttons';

interface Props {
  chickens: Chicken[];
  onAdd: () => void;
  onSelect: (id: number) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function HomeScreen({ chickens, onAdd, onSelect, refreshing = false, onRefresh }: Props) {
  const hatchingCount = chickens.filter((item) => item.activeHatching).length;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Galinhas</Text>
        <Text style={styles.subtitle}>
          {chickens.length === 0
            ? 'Nenhuma cadastrada'
            : `${chickens.length} galinha${chickens.length === 1 ? '' : 's'} cadastrada${chickens.length === 1 ? '' : 's'}`}
          {hatchingCount > 0 ? ` · ${hatchingCount} chocando` : ''}
        </Text>
      </View>

      {chickens.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐔</Text>
          <Text style={styles.emptyTitle}>Nenhuma galinha cadastrada</Text>
          <Text style={styles.emptyText}>Cadastre sua primeira galinha para começar.</Text>
          <PrimaryButton title="+ Cadastrar Galinha" onPress={onAdd} style={styles.emptyButton} />
        </View>
      ) : (
        <>
          <FlatList
            data={chickens}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ChickenCard chicken={item} onPress={() => onSelect(item.id)} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <PrimaryButton title="+ Cadastrar Galinha" onPress={onAdd} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 3 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 18 },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, backgroundColor: colors.background },
  empty: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 74, marginBottom: 18 },
  emptyTitle: { color: colors.text, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  emptyButton: { marginTop: 28, alignSelf: 'stretch' },
});
