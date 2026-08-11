import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LineDto } from '../models/line.dto';
import { StationDto } from '../models/station.dto';

@Service()
export class ApiService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8081';

  getLines(): Observable<LineDto[]> {
    return this.http.get<LineDto[]>(
      `${this.baseUrl}/api/lines`
    );
  }

  getStations(lineId: string): Observable<StationDto[]> {
    return this.http.get<StationDto[]>(
      `${this.baseUrl}/api/lines/${lineId}/stations`,
    )
  }
}
