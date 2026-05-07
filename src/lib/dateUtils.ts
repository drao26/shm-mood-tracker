const AEST_TIMEZONE = 'Australia/Sydney';

/** Return today's date in AEST as an ISO date string (YYYY-MM-DD). */
export function getAESTDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: AEST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

/** Return today's date in AEST formatted for display (DD-MM-YYYY). */
export function getAESTDisplayDate(): string {
  const iso = getAESTDate();
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}
