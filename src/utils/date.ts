const DAY_MS = 86_400_000;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toISODateLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODateLocal(new Date());
}

export function parseISODateLocal(value: string): Date {
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error('Data inválida.');
  }
  const [year, month, day] = parts as [number, number, number];
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDaysISO(value: string, days: number): string {
  const date = parseISODateLocal(value);
  date.setDate(date.getDate() + days);
  return toISODateLocal(date);
}

export function formatDateBR(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function parseDateBR(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return toISODateLocal(date);
}

export function maskDateBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function utcCalendarMs(value: string): number {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  return Date.UTC(year, month - 1, day);
}

export function daysBetween(startISO: string, endISO: string): number {
  return Math.round((utcCalendarMs(endISO) - utcCalendarMs(startISO)) / DAY_MS);
}

export function hatchingProgress(startDate: string, expectedDate: string): {
  elapsed: number;
  remaining: number;
  percentage: number;
  dueToday: boolean;
  overdue: boolean;
} {
  const today = todayISO();
  const elapsed = Math.max(0, Math.min(21, daysBetween(startDate, today)));
  const rawRemaining = daysBetween(today, expectedDate);
  return {
    elapsed,
    remaining: Math.max(0, rawRemaining),
    percentage: Math.min(100, Math.max(0, Math.round((elapsed / 21) * 100))),
    dueToday: rawRemaining === 0,
    overdue: rawRemaining < 0,
  };
}

export function notificationTimesForDate(expectedDate: string): Date[] {
  const base = parseISODateLocal(expectedDate);
  const times: Date[] = [];
  for (let hour = 0; hour < 24; hour += 2) {
    times.push(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0, 0));
  }
  return times;
}
