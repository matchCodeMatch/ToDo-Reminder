import { RepeatRule } from '../constants/types';

/**
 * Calculate the next occurrence date for a repeating task.
 * Returns the next date string in 'YYYY-MM-DD' format, or null if no repeat.
 */
export function getNextOccurrence(
  currentDate: string,
  currentTime: string,
  repeatRule: RepeatRule,
  repeatDays: number[]
): { date: string; time: string } | null {
  if (repeatRule === 'none') return null;

  const [year, month, day] = currentDate.split('-').map(Number);
  const current = new Date(year, month - 1, day);

  switch (repeatRule) {
    case 'daily': {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      return { date: formatDate(next), time: currentTime };
    }

    case 'weekly': {
      if (repeatDays.length === 0) {
        // If no days specified, repeat same day next week
        const next = new Date(current);
        next.setDate(next.getDate() + 7);
        return { date: formatDate(next), time: currentTime };
      }

      // Find the next matching day of the week
      const currentDow = current.getDay(); // 0=Sun, 1=Mon, ...
      const sortedDays = [...repeatDays].sort((a, b) => a - b);

      // Find next day after current day of week
      let nextDay = sortedDays.find((d) => d > currentDow);
      let daysToAdd: number;

      if (nextDay !== undefined) {
        daysToAdd = nextDay - currentDow;
      } else {
        // Wrap to next week, pick the first day
        nextDay = sortedDays[0];
        daysToAdd = 7 - currentDow + nextDay;
      }

      const next = new Date(current);
      next.setDate(next.getDate() + daysToAdd);
      return { date: formatDate(next), time: currentTime };
    }

    case 'monthly': {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      // Handle month overflow (e.g., Jan 31 -> Feb 28)
      if (next.getDate() !== current.getDate()) {
        next.setDate(0); // Last day of previous month
      }
      return { date: formatDate(next), time: currentTime };
    }

    default:
      return null;
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a date string for display.
 */
export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a time string for display (24h -> 12h).
 */
export function formatDisplayTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Get day-of-week label.
 */
export function getDayLabel(day: number): string {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return labels[day] || '';
}

/**
 * Get repeat rule display label.
 */
export function getRepeatLabel(rule: RepeatRule, days: number[]): string {
  switch (rule) {
    case 'none':
      return 'No repeat';
    case 'daily':
      return 'Daily';
    case 'weekly':
      if (days.length === 0) return 'Weekly';
      return `Weekly (${days.map(getDayLabel).join(', ')})`;
    case 'monthly':
      return 'Monthly';
    default:
      return '';
  }
}
