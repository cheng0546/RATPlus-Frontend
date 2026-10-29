export function fixMojibake(value: string): string {
  if (!/[\u00C2-\u00C5]/.test(value)) {
    return value;
  }
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 255) {
      return value;
    }
    bytes[i] = code;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}

export function shortLineName(name: string): string {
  const stripped = name.replace(/^(ligne|line|métro|metro)\s+/i, '').trim();
  return stripped.length > 4 ? stripped.slice(0, 4) : stripped;
}

const LINE_COLORS: Record<string, string> = {
  // RER / Transilien
  A: '#E2231A', B: '#5291CE', C: '#F5B400', D: '#00814F', E: '#A0006E',
  H: '#7B4F2F', J: '#CEC73D', K: '#9B9840', L: '#C4A4CA', N: '#00A88F',
  P: '#F58F53', R: '#F2A4C0', U: '#B90845', V: '#6E6E00',
  // Métro
  '1': '#FFCD00', '2': '#0064B1', '3': '#837902', '3B': '#6EC4E8', '4': '#C04191',
  '5': '#F28E42', '6': '#6ECA97', '7': '#FA9ABA', '7B': '#6ECA97', '8': '#C9A0DC',
  '9': '#B6BD00', '10': '#C9910D', '11': '#704B1C', '12': '#007852', '13': '#6EC4E8',
  '14': '#62259D',
  // Tram
  T1: '#0064B1', T2: '#C04191', T3a: '#F28E42', T3b: '#00814F', T4: '#E3B32A',
  T5: '#7F2D84', T6: '#E2231A', T7: '#7B5B2A', T8: '#6E6E00', T9: '#5291CE',
  T10: '#6E6E00', T11: '#F58F53', T12: '#A50034', T13: '#8B6A3F', T14: '#00A58E',
};

export function lineColor(name: string): string {
  return LINE_COLORS[name] ?? '#555555';
}

export function lineTextColor(name: string): string {
  const hex = lineColor(name).slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff';
}

export const LINE_GROUPS: { label: string; modes: string[] }[] = [
  { label: 'RER / Transilien', modes: ['RER', 'TRANSILIEN'] },
  { label: 'Métro', modes: ['METRO'] },
  { label: 'Tram', modes: ['TRAM'] },
];

export function minutesUntil(iso: string, now: number): number {
  return Math.floor((new Date(iso).getTime() - now) / 60000);
}

export function formatCountdown(minutes: number): string {
  return minutes <= 0 ? 'À quai' : `${minutes} min`;
}
