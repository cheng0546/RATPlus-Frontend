import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LineDto } from '../models/line.dto';
import { StationDto } from '../models/station.dto';
import { DepartureDto } from '../models/departure.dto';

@Service()
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'https://ratplus-api.onrender.com';
  // private readonly baseUrl = 'http://localhost:8081'; // local test

  getLines(): Observable<LineDto[]> {
    return this.http.get<LineDto[]>(`${this.baseUrl}/api/lines`);
  }

  getStations(lineId: string): Observable<StationDto[]> {
    return this.http.get<StationDto[]>(`${this.baseUrl}/api/lines/${lineId}/stations`);
  }

  getNextDepartures(lineId: string, stationIds: string[]): Observable<DepartureDto[]> {
    let params = new HttpParams().set('lineId', lineId);

    for (const stationId of stationIds) {
      params = params.append('stationIds', stationId);
    }

    return this.http.get<DepartureDto[]>(`${this.baseUrl}/api/departures`, { params });
  }
}
