import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Safely format a date string that may be null/undefined.
 * Falls back to current date if invalid.
 */
export function safeFormatDate(
  dateStr: string | null | undefined,
  formatStr: string
): string {
  const raw = dateStr ?? new Date().toISOString();
  try {
    return format(parseISO(raw), formatStr);
  } catch {
    return format(new Date(), formatStr);
  }
}

/**
 * Safely format "X time ago" for a date string that may be null/undefined.
 */
export function safeFormatDistanceToNow(
  dateStr: string | null | undefined,
  options?: { addSuffix?: boolean }
): string {
  const raw = dateStr ?? new Date().toISOString();
  try {
    return formatDistanceToNow(parseISO(raw), options ?? { addSuffix: true });
  } catch {
    return "just now";
  }
}
