import type { BreedCode } from '../types/models';

export const BREED_OPTIONS: Array<{ value: BreedCode; label: string }> = [
  { value: 'COMUM', label: 'Comum' },
  { value: 'GSB', label: 'GSB' },
  { value: 'MESTICA', label: 'Mestiça' },
  { value: 'INDIA', label: 'Índia' },
  { value: 'OUTRA', label: 'Outra raça' },
];

export function breedLabel(breed: BreedCode, customBreed: string | null): string {
  if (breed === 'OUTRA') return customBreed?.trim() || 'Outra raça';
  return BREED_OPTIONS.find((item) => item.value === breed)?.label ?? breed;
}
