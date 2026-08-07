export function formatTimeRemaining(diffMs: number): string {
  const totalMin = Math.floor(diffMs / 60000);

  if (totalMin < 1) return "< 1m remaining";

  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;

  if (days >= 1) return `${days}d ${hours}h remaining`;
  if (hours >= 1) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export function deadlineTickMs(diffMs: number): number {
  return Math.max(1000, Math.min(60000, diffMs));
}
