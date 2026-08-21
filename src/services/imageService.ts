import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const IMAGE_DIRECTORY_NAME = 'chocafacil-chickens';

function imageDirectory(): Directory {
  const directory = new Directory(Paths.document, IMAGE_DIRECTORY_NAME);
  if (!directory.exists) {
    directory.create({ idempotent: true, intermediates: true });
  }
  return directory;
}

function extensionFromUri(uri: string): string {
  const clean = uri.split('?')[0] ?? uri;
  const match = clean.match(/\.([A-Za-z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase();
  return ext && ext.length <= 5 ? ext : 'jpg';
}

export async function choosePhotoFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permissão da câmera não concedida.');
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function persistChickenImage(sourceUri: string): Promise<string> {
  if (sourceUri.includes(`/${IMAGE_DIRECTORY_NAME}/`)) return sourceUri;
  const directory = imageDirectory();
  const filename = `chicken-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFromUri(sourceUri)}`;
  const source = new File(sourceUri);
  const destination = new File(directory, filename);
  source.copy(destination);
  return destination.uri;
}

export async function deleteChickenImage(uri: string | null): Promise<void> {
  if (!uri || !uri.includes(`/${IMAGE_DIRECTORY_NAME}/`)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A foto já pode ter sido removida pelo sistema/usuário.
  }
}
