import { getDatabase } from '../database/db';
import type { BreedCode, Chicken, ChickenDetail, ChickenFormData, Hatching, HatchingHistoryItem } from '../types/models';

interface ChickenJoinRow {
  id: number;
  name: string;
  breed: BreedCode;
  custom_breed: string | null;
  image_uri: string | null;
  father_name: string | null;
  mother_name: string | null;
  created_at: string;
  updated_at: string;
  hatching_id: number | null;
  hatching_eggs: number | null;
  hatching_start_date: string | null;
  hatching_expected_date: string | null;
  hatching_created_at: string | null;
}

interface HatchingRow {
  id: number;
  chicken_id: number;
  eggs: number;
  start_date: string;
  expected_date: string;
  end_date: string | null;
  chicks: number | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

function mapHatching(row: HatchingRow): Hatching {
  return {
    id: row.id,
    chickenId: row.chicken_id,
    eggs: row.eggs,
    startDate: row.start_date,
    expectedDate: row.expected_date,
    endDate: row.end_date,
    chicks: row.chicks,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapChicken(row: ChickenJoinRow): Chicken {
  const activeHatching: Hatching | null = row.hatching_id
    ? {
        id: row.hatching_id,
        chickenId: row.id,
        eggs: row.hatching_eggs!,
        startDate: row.hatching_start_date!,
        expectedDate: row.hatching_expected_date!,
        endDate: null,
        chicks: null,
        status: 'ACTIVE',
        createdAt: row.hatching_created_at!,
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    customBreed: row.custom_breed,
    imageUri: row.image_uri,
    fatherName: row.father_name,
    motherName: row.mother_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    activeHatching,
  };
}

const CHICKEN_SELECT = `
  SELECT
    c.id, c.name, c.breed, c.custom_breed, c.image_uri,
    c.father_name, c.mother_name, c.created_at, c.updated_at,
    h.id AS hatching_id,
    h.eggs AS hatching_eggs,
    h.start_date AS hatching_start_date,
    h.expected_date AS hatching_expected_date,
    h.created_at AS hatching_created_at
  FROM chickens c
  LEFT JOIN hatchings h
    ON h.chicken_id = c.id AND h.status = 'ACTIVE'
`;

export async function listChickens(): Promise<Chicken[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ChickenJoinRow>(`${CHICKEN_SELECT} ORDER BY c.name COLLATE NOCASE ASC`);
  return rows.map(mapChicken);
}

export async function getChicken(id: number): Promise<ChickenDetail | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ChickenJoinRow>(`${CHICKEN_SELECT} WHERE c.id = ?`, id);
  if (!row) return null;

  const historyRows = await db.getAllAsync<HatchingRow>(
    `SELECT * FROM hatchings
     WHERE chicken_id = ? AND status = 'COMPLETED'
     ORDER BY COALESCE(end_date, expected_date) DESC, id DESC`,
    id,
  );

  return {
    ...mapChicken(row),
    history: historyRows.map(mapHatching) as HatchingHistoryItem[],
  };
}

export async function createChickenRecord(data: Omit<ChickenFormData, 'imageChanged'>): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO chickens
      (name, breed, custom_breed, image_uri, father_name, mother_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    data.name.trim(),
    data.breed,
    data.customBreed,
    data.imageUri,
    data.fatherName,
    data.motherName,
    now,
    now,
  );
  return result.lastInsertRowId;
}

export async function updateChickenRecord(
  id: number,
  data: Omit<ChickenFormData, 'imageChanged'>,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE chickens
     SET name = ?, breed = ?, custom_breed = ?, image_uri = ?, father_name = ?, mother_name = ?, updated_at = ?
     WHERE id = ?`,
    data.name.trim(),
    data.breed,
    data.customBreed,
    data.imageUri,
    data.fatherName,
    data.motherName,
    new Date().toISOString(),
    id,
  );
}

export async function deleteChickenRecord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chickens WHERE id = ?', id);
}
