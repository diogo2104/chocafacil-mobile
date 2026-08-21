import { getDatabase } from '../database/db';
import type { Hatching } from '../types/models';

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

function map(row: HatchingRow): Hatching {
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

export async function createHatchingRecord(
  chickenId: number,
  eggs: number,
  startDate: string,
  expectedDate: string,
): Promise<Hatching> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO hatchings
      (chicken_id, eggs, start_date, expected_date, status, created_at)
     VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
    chickenId,
    eggs,
    startDate,
    expectedDate,
    now,
  );
  const row = await db.getFirstAsync<HatchingRow>('SELECT * FROM hatchings WHERE id = ?', result.lastInsertRowId);
  if (!row) throw new Error('Não foi possível criar a chocagem.');
  return map(row);
}

export async function finishHatchingRecord(id: number, chicks: number | null, endDate: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE hatchings
     SET status = 'COMPLETED', chicks = ?, end_date = ?
     WHERE id = ? AND status = 'ACTIVE'`,
    chicks,
    endDate,
    id,
  );
}

export async function cancelHatchingRecord(id: number, endDate: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE hatchings
     SET status = 'CANCELLED', end_date = ?
     WHERE id = ? AND status = 'ACTIVE'`,
    endDate,
    id,
  );
}

export async function listActiveHatchings(): Promise<Array<Hatching & { chickenName: string }>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HatchingRow & { chicken_name: string }>(
    `SELECT h.*, c.name AS chicken_name
     FROM hatchings h
     JOIN chickens c ON c.id = h.chicken_id
     WHERE h.status = 'ACTIVE'`,
  );
  return rows.map((row) => ({ ...map(row), chickenName: row.chicken_name }));
}
