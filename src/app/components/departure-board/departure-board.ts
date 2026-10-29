import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { DepartureDto } from '../../models/departure.dto';
import { StationDto } from '../../models/station.dto';
import { minutesUntil } from '../../utils/line-utils';

const SLOW_HINT_MS = 4_000;

@Component({
  selector: 'app-departure-board',
  imports: [DatePipe],
  templateUrl: './departure-board.html',
  styleUrl: './departure-board.css',
})
export class DepartureBoard {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly lineId = input.required<string>();
  readonly station = input.required<StationDto>();
  readonly compact = input(false);

  protected readonly departures = signal<DepartureDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly slow = signal(false);
  protected readonly error = signal(false);
  protected readonly loaded = signal(false);
  protected readonly lastUpdate = signal<Date | null>(null);
  protected readonly now = signal(Date.now());
  private readonly selectedDirection = signal<string | null>(null);

  private request?: Subscription;
  private slowTimer?: ReturnType<typeof setTimeout>;

  protected readonly groups = computed(() => {
    const now = this.now();
    const map = new Map<string, DepartureDto[]>();

    for (const departure of this.departures()) {
      if (minutesUntil(departure.departureTime, now) < -1) {
        continue;
      }
      const list = map.get(departure.direction) ?? [];
      list.push(departure);
      map.set(departure.direction, list);
    }

    return [...map.entries()].map(([direction, items]) => ({
      direction,
      destination: items[0].destination,
      items: items.sort((a, b) => a.departureTime.localeCompare(b.departureTime)),
    }));
  });

  protected readonly activeGroup = computed(() => {
    const groups = this.groups();
    return groups.find((g) => g.direction === this.selectedDirection()) ?? groups[0] ?? null;
  });

  constructor() {
    effect(() => {
      this.lineId();
      this.station();
      untracked(() => {
        this.departures.set([]);
        this.loaded.set(false);
        this.selectedDirection.set(null);
        this.refresh();
      });
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.slowTimer);
      this.request?.unsubscribe();
    });
  }

  refresh(): void {
    this.request?.unsubscribe();
    clearTimeout(this.slowTimer);

    this.loading.set(true);
    this.slow.set(false);
    this.error.set(false);
    this.slowTimer = setTimeout(() => this.slow.set(true), SLOW_HINT_MS);

    this.request = this.api.getNextDepartures(this.lineId(), this.station().ids).subscribe({
      next: (departures) => {
        clearTimeout(this.slowTimer);
        this.departures.set(departures);
        this.now.set(Date.now());
        this.lastUpdate.set(new Date());
        this.loaded.set(true);
        this.loading.set(false);
        this.slow.set(false);
      },
      error: () => {
        clearTimeout(this.slowTimer);
        this.error.set(true);
        this.loading.set(false);
        this.slow.set(false);
      },
    });
  }

  protected selectDirection(direction: string): void {
    this.selectedDirection.set(direction);
  }

  protected statusLabel(status: string): string {
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
