import { Component, inject, signal } from '@angular/core';
import { ApiService } from './services/api.service';
import { StationDto } from './models/station.dto';
import { LineDto } from './models/line.dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private readonly apiService = inject(ApiService);

  protected readonly lines = signal<LineDto[]>([]);
  protected readonly stations = signal<StationDto[]>([]);

  constructor() {
    this.apiService.getLines().subscribe({
      next: lines => {
        console.log(lines);

        const sortedLines = [...lines].sort((a, b) =>
          a.name.localeCompare(b.name, 'fr'));
        this.lines.set(sortedLines);
      },
      error: err => {
        console.log(err);
      }
    })
  }

  protected onLineSelected(event: Event) {
    const select = event.target as HTMLSelectElement;
    const lineId = select.value;

    if (!lineId) {
      return;
    }

    this.apiService.getStations(lineId).subscribe({
      next: stations => {
        console.log(stations);

        const sortedStations = [...stations].sort((a, b) =>
          a.name.localeCompare(b.name, 'fr'));
        this.stations.set(sortedStations);
      },
      error: err => {
        console.log(err);
      }
    })

    console.log(lineId);
  }
}
