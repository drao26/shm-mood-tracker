/** Return today's date in the user's local timezone as an ISO date string (YYYY-MM-DD). */
export function getLocalDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

/** Format an ISO date string (YYYY-MM-DD) for display (DD-MM-YYYY). */
export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

/** Return today's date in the user's local timezone formatted for display (DD-MM-YYYY). */
export function getLocalDisplayDate(): string {
  return formatDisplayDate(getLocalDate());
}

/** @deprecated Use getLocalDate instead */
export const getAESTDate = getLocalDate;
/** @deprecated Use getLocalDisplayDate instead */
export const getAESTDisplayDate = getLocalDisplayDate;
