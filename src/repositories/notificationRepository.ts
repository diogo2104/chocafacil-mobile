import { getDatabase } from '../database/db';

interface NotificationRow {
  notification_identifier: string;
  scheduled_at: string;
}

export async function saveNotificationRecord(
  hatchingId: number,
  identifier: string,
  scheduledAt: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO scheduled_notifications
      (hatching_id, notification_identifier, scheduled_at)
     VALUES (?, ?, ?)`,
    hatchingId,
    identifier,
    scheduledAt,
  );
}

export async function getNotificationRecords(
  hatchingId: number,
): Promise<Array<{ identifier: string; scheduledAt: string }>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<NotificationRow>(
    `SELECT notification_identifier, scheduled_at
     FROM scheduled_notifications
     WHERE hatching_id = ?`,
    hatchingId,
  );
  return rows.map((row) => ({
    identifier: row.notification_identifier,
    scheduledAt: row.scheduled_at,
  }));
}

export async function deleteNotificationRecords(hatchingId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM scheduled_notifications WHERE hatching_id = ?', hatchingId);
}
