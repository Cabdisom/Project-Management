const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function hasTime(d: Date): boolean {
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatShortDate(d: Date, now = new Date()): string {
  const sameYear = d.getFullYear() === now.getFullYear();
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${sameYear ? '' : ` ${d.getFullYear()}`}`;
}

/** "Today 11:00", "Tomorrow", "Yesterday", "Mon 12 Oct" */
export function formatDue(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  const today = startOfDay(now);
  const diffDays = Math.round((startOfDay(d).getTime() - today.getTime()) / DAY);
  let day: string;
  if (diffDays === 0) day = 'Today';
  else if (diffDays === 1) day = 'Tomorrow';
  else if (diffDays === -1) day = 'Yesterday';
  else day = formatShortDate(d, now);
  return hasTime(d) ? `${day} ${formatTime(d)}` : day;
}

export function isOverdue(iso: string | null | undefined, now = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (hasTime(d)) return d.getTime() < now.getTime();
  return startOfDay(d).getTime() < startOfDay(now).getTime();
}

export type DueGroup = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'none';

export const DueGroupLabels: Record<DueGroup, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'This week',
  later: 'Later',
  none: 'No date',
};

export const DueGroupOrder: DueGroup[] = ['overdue', 'today', 'tomorrow', 'week', 'later', 'none'];

export function dueGroup(iso: string | null | undefined, now = new Date()): DueGroup {
  if (!iso) return 'none';
  if (isOverdue(iso, now)) return 'overdue';
  const d = new Date(iso);
  const diffDays = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return 'week';
  return 'later';
}

/** "Just now", "5m", "2h", "Yesterday", "Mon 12 Oct" */
export function formatRelative(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (isSameDay(d, now)) return formatTime(d);
  if (isSameDay(d, addDays(now, -1))) return `Yesterday ${formatTime(d)}`;
  return formatShortDate(d, now);
}

export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, addDays(now, -1))) return 'Yesterday';
  return formatShortDate(d, now);
}
