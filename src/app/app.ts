import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectChange } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from './services/api.service';
import { StationDto } from './models/station.dto';
import { LineDto } from './models/line.dto';
import { DepartureDto } from './models/departure.dto';

@Component({
  selector: 'app-root',
  imports: [DatePipe, MatFormFieldModule, MatSelectModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly apiService = inject(ApiService);

  protected readonly lines = signal<LineDto[]>([]);
  protected readonly stations = signal<StationDto[]>([]);
  protected readonly departures = signal<DepartureDto[]>([]);

  protected readonly selectedLineId = signal<string>('');
  protected readonly selectedStation = signal<StationDto | null>(null);

  protected readonly loading = signal(false);
  protected readonly hasSearched = signal(false);

  protected readonly groupedDepartures = computed(() => {
    const groups = new Map<string, DepartureDto[]>();

    for (const departure of this.departures()) {
      const existing = groups.get(departure.direction);

      if (existing) {
        existing.push(departure);
      } else {
        groups.set(departure.direction, [departure]);
      }
    }

    return groups;
  });

  constructor() {
    this.apiService.getLines().subscribe({
      next: (lines) => {
        const sortedLines = [...lines].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        this.lines.set(sortedLines);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  protected onLineSelected(event: MatSelectChange) {
    const lineId = event.value;

    this.selectedStation.set(null);
    this.selectedLineId.set(lineId);

    if (!lineId) {
      console.error('No line selected');
      this.stations.set([]);
      return;
    }

    this.apiService.getStations(lineId).subscribe({
      next: (stations) => {
        const sortedStations = [...stations].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        this.stations.set(sortedStations);
      },
      error: (err) => {
        console.log(err);
        this.stations.set([]);
      },
    });
  }

  protected onStationSelected(event: MatSelectChange) {
    const stationName = event.value;

    if (!stationName) {
      console.error('No station selected');
      this.selectedStation.set(null);
      return;
    }

    const station = this.stations().find((station) => station.name === stationName);

    if (!station) {
      console.error('Cannot find station');
      return;
    }

    this.selectedStation.set(station);
  }

  protected searchDepartures(): void {
    this.departures.set([]);
    const lineId = this.selectedLineId();
    const station = this.selectedStation();

    if (!lineId || !station) {
      console.error('Missed line or station');
      return;
    }

    this.hasSearched.set(true);
    this.loading.set(true);

    this.apiService.getNextDepartures(lineId, station.ids).subscribe({
      next: (departures) => {
        this.departures.set(departures);
        this.loading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.departures.set([]);
        this.loading.set(false);
      },
    });
  }

  protected formatStatus(status: string): string {
    switch (status) {
      case 'onTime':
        return "À l'heure";
      case 'delayed':
        return 'En retard';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  }
}
