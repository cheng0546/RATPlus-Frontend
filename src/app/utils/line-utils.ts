export function shortLineName(name: string): string {
  const stripped = name.replace(/^(ligne|line|métro|metro)\s+/i, '').trim();
  return stripped.length > 4 ? stripped.slice(0, 4) : stripped;
}

// Stable, muted colour per line so badges are distinguishable without
// reusing any operator's official palette.
export function lineColor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `hsl(${(hash * 47) % 360} 55% 42%)`;
}

export function minutesUntil(iso: string, now: number): number {
  return Math.floor((new Date(iso).getTime() - now) / 60000);
}

export function formatCountdown(minutes: number): string {
  return minutes <= 0 ? 'À quai' : `${minutes} min`;
}
