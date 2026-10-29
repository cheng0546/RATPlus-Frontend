import { TestBed } from '@angular/core/testing';
import { FavoritesService, MAX_FAVORITES } from './favorites.service';

const fav = (n: number) => ({
  lineId: 'L1',
  lineName: 'Ligne 1',
  station: { name: `Station ${n}`, ids: [`${n}`], label: `Station ${n}` },
});

describe('FavoritesService', () => {
  beforeEach(() => localStorage.clear());

  it('caps favourites and ignores duplicates', () => {
    const service = TestBed.inject(FavoritesService);
    for (let i = 0; i < MAX_FAVORITES; i++) {
      expect(service.add(fav(i))).toBe(true);
    }
    expect(service.add(fav(99))).toBe(false);
    service.remove('L1', 'Station 0');
    expect(service.add(fav(1))).toBe(false);
    expect(service.favorites().length).toBe(MAX_FAVORITES - 1);
  });
});
