const DEFAULT_INTERVAL_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Parses PostgreSQL interval representations into milliseconds.
 * Supports:
 * - "X days" / "X day" (e.g. "2 days", "1 day")
 * - "X hours" / "X hour" (e.g. "12 hours")
 * - "HH:MM:SS" / "HH:MM" (e.g. "48:00:00", "02:30:00")
 * - Compound formats (e.g. "2 days 04:00:00")
 * - ISO 8601 durations (e.g. "P2D", "PT48H", "P1DT12H")
 */
export function parsePostgresInterval(
  interval: string | null | undefined
): number {
  if (!interval) return DEFAULT_INTERVAL_MS;

  const trimmed = interval.trim();

  // ISO 8601 Duration (e.g. P2D, PT48H, P1DT12H)
  if (trimmed.startsWith("P")) {
    let ms = 0;
    const daysMatch = trimmed.match(/(\d+)\s*D/i);
    const hoursMatch = trimmed.match(/(\d+)\s*H/i);
    const minsMatch = trimmed.match(/(\d+)\s*M/i);
    const secsMatch = trimmed.match(/(\d+)\s*S/i);
    if (daysMatch) ms += parseInt(daysMatch[1], 10) * 86400000;
    if (hoursMatch) ms += parseInt(hoursMatch[1], 10) * 3600000;
    if (minsMatch) ms += parseInt(minsMatch[1], 10) * 60000;
    if (secsMatch) ms += parseInt(secsMatch[1], 10) * 1000;
    return ms > 0 ? ms : DEFAULT_INTERVAL_MS;
  }

  let totalMs = 0;
  let remaining = trimmed;

  const dayMatch = remaining.match(/^(\d+)\s*days?/i);
  if (dayMatch) {
    totalMs += parseInt(dayMatch[1], 10) * 86400000;
    remaining = remaining.slice(dayMatch[0].length).trim();
  }

  const hourMatch = remaining.match(/^(\d+)\s*hours?/i);
  if (hourMatch) {
    totalMs += parseInt(hourMatch[1], 10) * 3600000;
    remaining = remaining.slice(hourMatch[0].length).trim();
  }

  const minMatch = remaining.match(/^(\d+)\s*mins?|minutes?/i);
  if (minMatch) {
    totalMs += parseInt(minMatch[1], 10) * 60000;
    remaining = remaining.slice(minMatch[0].length).trim();
  }

  // "HH:MM:SS" or "HH:MM"
  const timeMatch = remaining.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    totalMs += (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  return totalMs > 0 ? totalMs : DEFAULT_INTERVAL_MS;
}
