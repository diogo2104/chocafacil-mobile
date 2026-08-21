import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getNotificationRecords, saveNotificationRecord, deleteNotificationRecords } from '../repositories/notificationRepository';
import { notificationTimesForDate } from '../utils/date';

const CHANNEL_ID = 'hatching-alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Avisos de chocagem',
    description: 'Avisos locais no dia previsto para o nascimento dos pintinhos.',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 180, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await configureNotificationChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return status.granted;
}

export async function scheduleHatchingNotifications(input: {
  hatchingId: number;
  chickenName: string;
  eggs: number;
  expectedDate: string;
  askPermission?: boolean;
}): Promise<{ permissionGranted: boolean; scheduled: number }> {
  const granted = input.askPermission === false
    ? await hasNotificationPermission()
    : await requestNotificationPermission();

  if (!granted) return { permissionGranted: false, scheduled: 0 };

  await cancelHatchingNotifications(input.hatchingId);
  const now = Date.now();
  let scheduled = 0;

  for (const date of notificationTimesForDate(input.expectedDate)) {
    if (date.getTime() <= now + 5_000) continue;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐣 Nascimento previsto hoje!',
        body: `${input.chickenName} está na data prevista para tirar os pintinhos. 🥚 ${input.eggs} ovos em chocagem.`,
        sound: 'default',
        data: {
          type: 'HATCHING_DUE',
          hatchingId: input.hatchingId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: CHANNEL_ID,
      },
    });

    await saveNotificationRecord(input.hatchingId, identifier, date.toISOString());
    scheduled += 1;
  }

  return { permissionGranted: true, scheduled };
}

export async function cancelHatchingNotifications(hatchingId: number): Promise<void> {
  const records = await getNotificationRecords(hatchingId);
  for (const record of records) {
    try {
      await Notifications.cancelScheduledNotificationAsync(record.identifier);
    } catch {
      // Mantém o cancelamento idempotente mesmo se o Android já removeu o alarme.
    }
  }
  await deleteNotificationRecords(hatchingId);
}

export async function countStoredNotifications(hatchingId: number): Promise<number> {
  return (await getNotificationRecords(hatchingId)).length;
}
