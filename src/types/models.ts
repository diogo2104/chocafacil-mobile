export type BreedCode = 'COMUM' | 'GSB' | 'MESTICA' | 'INDIA' | 'OUTRA';
export type HatchingStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Chicken {
  id: number;
  name: string;
  breed: BreedCode;
  customBreed: string | null;
  imageUri: string | null;
  fatherName: string | null;
  motherName: string | null;
  createdAt: string;
  updatedAt: string;
  activeHatching: Hatching | null;
}

export interface Hatching {
  id: number;
  chickenId: number;
  eggs: number;
  startDate: string;
  expectedDate: string;
  endDate: string | null;
  chicks: number | null;
  status: HatchingStatus;
  createdAt: string;
}

export interface HatchingHistoryItem extends Hatching {}

export interface ChickenDetail extends Chicken {
  history: HatchingHistoryItem[];
}

export interface ChickenFormData {
  name: string;
  breed: BreedCode;
  customBreed: string | null;
  fatherName: string | null;
  motherName: string | null;
  imageUri: string | null;
  imageChanged: boolean;
}

export interface StartHatchingInput {
  chickenId: number;
  chickenName: string;
  eggs: number;
  startDate: string;
}

export interface StartHatchingResult {
  hatching: Hatching;
  notificationsScheduled: number;
  notificationPermissionGranted: boolean;
}
