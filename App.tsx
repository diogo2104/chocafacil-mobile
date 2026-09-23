import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/db';
import type { Chicken, ChickenDetail, ChickenFormData } from './src/types/models';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChickenFormScreen } from './src/screens/ChickenFormScreen';
import { ChickenDetailScreen } from './src/screens/ChickenDetailScreen';
import { StartHatchingScreen } from './src/screens/StartHatchingScreen';
import { RegisterChicksScreen } from './src/screens/RegisterChicksScreen';
import { HatchingDoneScreen } from './src/screens/HatchingDoneScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { FatalErrorScreen, LoadingScreen } from './src/screens/AppStateScreens';
import { Toast } from './src/components/Toast';
import { configureNotificationChannel } from './src/services/notificationService';
import {  
  cancelHatching,
  createChicken,
  deleteChicken,
  finishHatching,
  getAllChickens,
  getChickenDetail, 
  reactivateHatchingNotifications,
  reconcileExistingNotifications,
  startHatching,
  updateChicken,
} from './src/services/chickenService';

// Navegação propositalmente local e pequena para evitar dependências extras.
type Screen = 'splash' | 'home' | 'add' | 'detail' | 'edit' | 'startHatching' | 'registerChicks' | 'done';

interface DoneData {
  name: string;
  eggs: number;
  chicks: number | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('splash');
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ChickenDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [doneData, setDoneData] = useState<DoneData | null>(null);
  const [, setClockTick] = useState(0);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadList = useCallback(async () => {
    const data = await getAllChickens();
    setChickens(data);
  }, []);

  const loadSelected = useCallback(async (id: number) => {
    const detail = await getChickenDetail(id);
    setSelected(detail);
    if (!detail) {
      setSelectedId(null);
      setScreen('home');
    }
    return detail;
  }, []);

  const boot = useCallback(async () => {
    setBooting(true);
    setFatalError(null);
    try {
      await initDatabase();
      await configureNotificationChannel();
      await loadList();
      void reconcileExistingNotifications();
      setScreen('splash');
      setTimeout(() => setScreen('home'), 900);
    } catch (error) {
      setFatalError(errorMessage(error));
    } finally {
      setBooting(false);
    }
  }, [loadList]);

  useEffect(() => {
    void boot();
  }, [boot]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = setInterval(() => setClockTick((value) => value + 1), 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setClockTick((value) => value + 1);
        void loadList();
        if (selectedId) void loadSelected(selectedId);
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [loadList, loadSelected, selectedId]);

  async function refreshHome() {
    setRefreshing(true);
    try {
      await loadList();
    } catch (error) {
      Alert.alert('Erro', errorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }

  async function openChicken(id: number) {
    try {
      setSelectedId(id);
      const detail = await loadSelected(id);
      if (detail) setScreen('detail');
    } catch (error) {
      Alert.alert('Erro', errorMessage(error));
    }
  }

  async function handleCreate(data: ChickenFormData) {
    try {
      await createChicken(data);
      await loadList();
      setScreen('home');
      showToast('Galinha cadastrada com sucesso! ✅');
    } catch (error) {
      Alert.alert('Não foi possível salvar', errorMessage(error));
      throw error;
    }
  }

  async function handleUpdate(data: ChickenFormData) {
    if (!selectedId) return;
    try {
      await updateChicken(selectedId, data);
      await Promise.all([loadList(), loadSelected(selectedId)]);
      setScreen('detail');
      showToast('Galinha atualizada! ✅');
    } catch (error) {
      Alert.alert('Não foi possível atualizar', errorMessage(error));
      throw error;
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    try {
      await deleteChicken(selectedId);
      setSelected(null);
      setSelectedId(null);
      await loadList();
      setScreen('home');
      showToast('Galinha excluída.');
    } catch (error) {
      Alert.alert('Não foi possível excluir', errorMessage(error));
    }
  }

  async function handleStartHatching(eggs: number, startDate: string) {
    if (!selectedId || !selected) return;
    try {
      const result = await startHatching({
        chickenId: selectedId,
        chickenName: selected.name,
        eggs,
        startDate,
      });
      await Promise.all([loadList(), loadSelected(selectedId)]);
      setScreen('detail');
      if (!result.notificationPermissionGranted) {
        showToast('Chocagem iniciada. Ative as notificações do Android para receber os avisos.');
      } else if (result.notificationsScheduled === 0) {
        showToast('Chocagem iniciada. Não havia horários futuros para agendar avisos.');
      } else {
        showToast(`Chocagem iniciada! 🔔 ${result.notificationsScheduled} avisos agendados.`);
      }
    } catch (error) {
      Alert.alert('Não foi possível iniciar a chocagem', errorMessage(error));
      throw error;
    }
  }

  async function handleFinishHatching(chicks: number | null) {
    if (!selectedId || !selected?.activeHatching) return;
    const { id: hatchingId, eggs } = selected.activeHatching;
    const name = selected.name;
    try {
      await finishHatching(hatchingId, chicks);
      setDoneData({ name, eggs, chicks });
      await Promise.all([loadList(), loadSelected(selectedId)]);
      setScreen('done');
    } catch (error) {
      Alert.alert('Não foi possível finalizar', errorMessage(error));
      throw error;
    }
  }

  async function handleCancelHatching() {
    if (!selectedId || !selected?.activeHatching) return;
    try {
      await cancelHatching(selected.activeHatching.id);
      await Promise.all([loadList(), loadSelected(selectedId)]);
      setScreen('detail');
      showToast('Modo de chocagem cancelado e avisos removidos.');
    } catch (error) {
      Alert.alert('Não foi possível cancelar', errorMessage(error));
    }
  }

  async function handleReactivateNotifications() {
    if (!selected) return;
    try {
      const count = await reactivateHatchingNotifications(selected);
      showToast(count > 0 ? `🔔 ${count} avisos agendados.` : 'Não foi possível agendar novos avisos. Verifique as permissões do Android.');
    } catch (error) {
      Alert.alert('Notificações', errorMessage(error));
    }
  }

  if (booting && !fatalError) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <LoadingScreen />
      </View>
    );
  }

  if (fatalError) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <FatalErrorScreen message={fatalError} onRetry={() => void boot()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={screen === 'splash' ? 'light' : 'dark'} />

      {screen === 'splash' ? <SplashScreen /> : null}

      {screen === 'home' ? (
        <HomeScreen
          chickens={chickens}
          onAdd={() => setScreen('add')}
          onSelect={(id) => void openChicken(id)}
          refreshing={refreshing}
          onRefresh={() => void refreshHome()}
        />
      ) : null}

      {screen === 'add' ? (
        <ChickenFormScreen
          onSave={handleCreate}
          onCancel={() => setScreen('home')}
        />
      ) : null}

      {screen === 'detail' && selected ? (
        <ChickenDetailScreen
          chicken={selected}
          onBack={() => setScreen('home')}
          onEdit={() => setScreen('edit')}
          onDelete={() => void handleDelete()}
          onStartHatching={() => setScreen('startHatching')}
          onFinishHatching={() => setScreen('registerChicks')}
          onCancelHatching={() => void handleCancelHatching()}
          onReactivateNotifications={handleReactivateNotifications}
        />
      ) : null}

      {screen === 'edit' && selected ? (
        <ChickenFormScreen
          initial={selected}
          onSave={handleUpdate}
          onCancel={() => setScreen('detail')}
        />
      ) : null}

      {screen === 'startHatching' && selected ? (
        <StartHatchingScreen
          chicken={selected}
          onBack={() => setScreen('detail')}
          onConfirm={handleStartHatching}
        />
      ) : null}

      {screen === 'registerChicks' && selected?.activeHatching ? (
        <RegisterChicksScreen
          chickenName={selected.name}
          eggs={selected.activeHatching.eggs}
          onBack={() => setScreen('detail')}
          onFinalize={handleFinishHatching}
        />
      ) : null}

      {screen === 'done' && doneData ? (
        <HatchingDoneScreen
          name={doneData.name}
          eggs={doneData.eggs}
          chicks={doneData.chicks}
          onGoHome={() => {
            setDoneData(null);
            setSelected(null);
            setSelectedId(null);
            setScreen('home');
          }}
        />
      ) : null}

      {toast ? <Toast message={toast} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
