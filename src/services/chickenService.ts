import { createChickenRecord, deleteChickenRecord, getChicken, listChickens, updateChickenRecord } from '../repositories/chickenRepository';
import { cancelHatchingRecord, createHatchingRecord, finishHatchingRecord, listActiveHatchings } from '../repositories/hatchingRepository';
import { countStoredNotifications, cancelHatchingNotifications, scheduleHatchingNotifications } from './notificationService';
import { deleteChickenImage, persistChickenImage } from './imageService';
import type { Chicken, ChickenDetail, ChickenFormData, StartHatchingInput, StartHatchingResult } from '../types/models';
import { addDaysISO, todayISO } from '../utils/date';

function normalizeForm(data: ChickenFormData, imageUri: string | null): Omit<ChickenFormData, 'imageChanged'> {
  return {
    name: data.name.trim(),
    breed: data.breed,
    customBreed: data.breed === 'OUTRA' ? data.customBreed?.trim() || null : null,
    fatherName: data.fatherName?.trim() || null,
    motherName: data.motherName?.trim() || null,
    imageUri,
  };
}

export async function getAllChickens(): Promise<Chicken[]> {
  return listChickens();
}

export async function getChickenDetail(id: number): Promise<ChickenDetail | null> {
  return getChicken(id);
}

export async function createChicken(data: ChickenFormData): Promise<number> {
  let persistedImage: string | null = null;
  try {
    persistedImage = data.imageUri ? await persistChickenImage(data.imageUri) : null;
    return await createChickenRecord(normalizeForm(data, persistedImage));
  } catch (error) {
    if (persistedImage) await deleteChickenImage(persistedImage);
    throw error;
  }
}

export async function updateChicken(id: number, data: ChickenFormData): Promise<void> {
  const current = await getChicken(id);
  if (!current) throw new Error('Galinha não encontrada.');

  let nextImageUri = current.imageUri;
  let newlyPersisted: string | null = null;

  if (data.imageChanged) {
    if (data.imageUri) {
      newlyPersisted = await persistChickenImage(data.imageUri);
      nextImageUri = newlyPersisted;
    } else {
      nextImageUri = null;
    }
  }

  try {
    await updateChickenRecord(id, normalizeForm(data, nextImageUri));
    if (data.imageChanged && current.imageUri && current.imageUri !== nextImageUri) {
      await deleteChickenImage(current.imageUri);
    }
  } catch (error) {
    if (newlyPersisted) await deleteChickenImage(newlyPersisted);
    throw error;
  }
}

export async function deleteChicken(id: number): Promise<void> {
  const current = await getChicken(id);
  if (!current) return;
  if (current.activeHatching) {
    await cancelHatchingNotifications(current.activeHatching.id);
  }
  await deleteChickenRecord(id);
  await deleteChickenImage(current.imageUri);
}

export async function startHatching(input: StartHatchingInput): Promise<StartHatchingResult> {
  if (!Number.isInteger(input.eggs) || input.eggs <= 0) {
    throw new Error('A quantidade de ovos deve ser maior que zero.');
  }
  const expectedDate = addDaysISO(input.startDate, 21);
  const hatching = await createHatchingRecord(input.chickenId, input.eggs, input.startDate, expectedDate);

  try {
    const notificationResult = await scheduleHatchingNotifications({
      hatchingId: hatching.id,
      chickenName: input.chickenName,
      eggs: input.eggs,
      expectedDate,
      askPermission: true,
    });
    return {
      hatching,
      notificationsScheduled: notificationResult.scheduled,
      notificationPermissionGranted: notificationResult.permissionGranted,
    };
  } catch {
    return {
      hatching,
      notificationsScheduled: 0,
      notificationPermissionGranted: false,
    };
  }
}

export async function finishHatching(hatchingId: number, chicks: number | null): Promise<void> {
  await cancelHatchingNotifications(hatchingId);
  await finishHatchingRecord(hatchingId, chicks, todayISO());
}

export async function cancelHatching(hatchingId: number): Promise<void> {
  await cancelHatchingNotifications(hatchingId);
  await cancelHatchingRecord(hatchingId, todayISO());
}

export async function reactivateHatchingNotifications(detail: ChickenDetail): Promise<number> {
  const hatching = detail.activeHatching;
  if (!hatching) return 0;
  const result = await scheduleHatchingNotifications({
    hatchingId: hatching.id,
    chickenName: detail.name,
    eggs: hatching.eggs,
    expectedDate: hatching.expectedDate,
    askPermission: true,
  });
  return result.scheduled;
}

export async function reconcileExistingNotifications(): Promise<void> {
  const active = await listActiveHatchings();
  for (const hatching of active) {
    const storedCount = await countStoredNotifications(hatching.id);
    if (storedCount > 0) continue;
    try {
      await scheduleHatchingNotifications({
        hatchingId: hatching.id,
        chickenName: hatching.chickenName,
        eggs: hatching.eggs,
        expectedDate: hatching.expectedDate,
        askPermission: false,
      });
    } catch {
      // Nunca impede o app de abrir por causa de notificações.
    }
  }
}
