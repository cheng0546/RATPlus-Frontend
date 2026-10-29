import { Component, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from './services/api.service';
import { Favorite, FavoritesService, MAX_FAVORITES } from './services/favorites.service';
import { StationDto } from './models/station.dto';
import { LineDto } from './models/line.dto';
import { DepartureBoard } from './components/departure-board/departure-board';
import { LINE_GROUPS, lineColor, lineTextColor, shortLineName } from './utils/line-utils';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

@Component({
  selector: 'app-root',
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, DepartureBoard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly apiService = inject(ApiService);
  protected readonly favoritesService = inject(FavoritesService);

  protected readonly maxFavorites = MAX_FAVORITES;
  protected readonly lines = signal<LineDto[]>([]);
  protected readonly linesLoading = signal(true);
  protected readonly linesError = signal(false);
  protected readonly stations = signal<StationDto[]>([]);
  protected readonly stationsLoading = signal(false);
  protected readonly stationsError = signal(false);

  protected readonly selectedLine = signal<LineDto | null>(null);
  protected readonly selectedStation = signal<StationDto | null>(null);
  protected readonly query = signal('');

  protected readonly lineGroups = computed(() =>
    LINE_GROUPS.map((group) => ({
      label: group.label,
      lines: this.lines().filter((line) => group.modes.includes(line.mode)),
    })).filter((group) => group.lines.length > 0),
  );

  protected readonly filteredStations = computed(() => {
    const all = this.stations();
    // Show the full list when the input just holds the chosen station's name.
    if (this.selectedStation()?.name === this.query()) {
      return all;
    }
    const q = normalize(this.query().trim());
    return q ? all.filter((s) => normalize(s.name).includes(q)) : all;
  });

  protected readonly isFavorite = computed(() => {
    const line = this.selectedLine();
    const station = this.selectedStation();
    return !!line && !!station && this.favoritesService.has(line.id, station.name);
  });

  protected readonly favoritesFull = computed(
    () => this.favoritesService.favorites().length >= MAX_FAVORITES,
  );

  private stationsRequest?: Subscription;

  constructor() {
    this.loadLines();
  }

  protected loadLines(): void {
    this.linesLoading.set(true);
    this.linesError.set(false);

    this.apiService.getLines().subscribe({
      next: (lines) => {
        this.lines.set(
          [...lines].sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true })),
        );
        this.linesLoading.set(false);
      },
      error: () => {
        this.linesError.set(true);
        this.linesLoading.set(false);
      },
    });
  }

  protected selectLine(line: LineDto): void {
    if (this.selectedLine()?.id === line.id) {
      return;
    }
    this.selectedLine.set(line);
    this.selectedStation.set(null);
    this.query.set('');
    this.loadStations(line);
  }

  protected loadStations(line: LineDto): void {
    this.stationsRequest?.unsubscribe();
    this.stations.set([]);
    this.stationsLoading.set(true);
    this.stationsError.set(false);

    this.stationsRequest = this.apiService.getStations(line.id).subscribe({
      next: (stations) => {
        this.stations.set([...stations].sort((a, b) => a.name.localeCompare(b.name, 'fr')));
        this.stationsLoading.set(false);
      },
      error: () => {
        this.stationsError.set(true);
        this.stationsLoading.set(false);
      },
    });
  }

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.selectedStation.set(null);
  }

  protected onStationSelected(event: MatAutocompleteSelectedEvent): void {
    const station = this.stations().find((s) => s.name === event.option.value);
    if (station) {
      this.query.set(station.name);
      this.selectedStation.set(station);
    }
  }

  protected toggleFavorite(): void {
    const line = this.selectedLine();
    const station = this.selectedStation();
    if (!line || !station) {
      return;
    }
    if (this.isFavorite()) {
      this.favoritesService.remove(line.id, station.name);
    } else {
      this.favoritesService.add({ lineId: line.id, lineName: line.name, station });
    }
  }

  protected removeFavorite(favorite: Favorite): void {
    this.favoritesService.remove(favorite.lineId, favorite.station.name);
  }

  protected badge(name: string): string {
    return shortLineName(name);
  }

  protected color(name: string): string {
    return lineColor(name);
  }

  protected textColor(name: string): string {
    return lineTextColor(name);
  }
}
