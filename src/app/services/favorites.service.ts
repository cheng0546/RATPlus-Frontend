import { Service, signal } from '@angular/core';
import { StationDto } from '../models/station.dto';

export interface Favorite {
  lineId: string;
  lineName: string;
  station: StationDto;
}

const STORAGE_KEY = 'lma.favorites';
export const MAX_FAVORITES = 3;

@Service()
export class FavoritesService {
  readonly favorites = signal<Favorite[]>(this.load());

  isFull(): boolean {
    return this.favorites().length >= MAX_FAVORITES;
  }

  has(lineId: string, stationName: string): boolean {
    return this.favorites().some((f) => f.lineId === lineId && f.station.name === stationName);
  }

  add(favorite: Favorite): boolean {
    if (this.isFull() || this.has(favorite.lineId, favorite.station.name)) {
      return false;
    }
    this.save([...this.favorites(), favorite]);
    return true;
  }

  remove(lineId: string, stationName: string): void {
    this.save(
      this.favorites().filter((f) => !(f.lineId === lineId && f.station.name === stationName)),
    );
  }

  private save(favorites: Favorite[]): void {
    this.favorites.set(favorites);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage unavailable (private mode): keep in memory only.
    }
  }

  private load(): Favorite[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (f) =>
            typeof f?.lineId === 'string' &&
            typeof f?.lineName === 'string' &&
            typeof f?.station?.name === 'string' &&
            Array.isArray(f?.station?.ids),
        )
        .slice(0, MAX_FAVORITES);
    } catch {
      return [];
    }
  }
}
