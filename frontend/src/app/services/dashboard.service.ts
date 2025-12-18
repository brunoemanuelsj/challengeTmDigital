import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/leads/statistics/dashboard`);
  }
}
