import { formatCountdown, minutesUntil, shortLineName } from './line-utils';

describe('line-utils', () => {
  it('shortens line names', () => {
    expect(shortLineName('Ligne 14')).toBe('14');
    expect(shortLineName('7bis')).toBe('7bis');
  });

  it('formats countdowns', () => {
    expect(formatCountdown(0)).toBe('À quai');
    expect(formatCountdown(5)).toBe('5 min');
  });

  it('computes minutes until a departure', () => {
    const now = Date.parse('2026-01-01T10:00:00Z');
    expect(minutesUntil('2026-01-01T10:03:30Z', now)).toBe(3);
  });
});
