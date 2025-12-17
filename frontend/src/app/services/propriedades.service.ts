import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Propriedade, CreatePropriedadeDto, UpdatePropriedadeDto } from '../models/propriedade.model';

@Injectable({
  providedIn: 'root',
})
export class PropriedadesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPropriedades(leadId?: string): Observable<Propriedade[]> {
    const url = leadId
      ? `${this.apiUrl}/propriedades?leadId=${leadId}`
      : `${this.apiUrl}/propriedades`;
    return this.http.get<Propriedade[]>(url);
  }

  getPropriedade(id: string): Observable<Propriedade> {
    return this.http.get<Propriedade>(`${this.apiUrl}/propriedades/${id}`);
  }

  createPropriedade(propriedadeData: CreatePropriedadeDto): Observable<Propriedade> {
    return this.http.post<Propriedade>(`${this.apiUrl}/propriedades`, propriedadeData);
  }

  updatePropriedade(id: string, propriedadeData: UpdatePropriedadeDto): Observable<Propriedade> {
    return this.http.patch<Propriedade>(`${this.apiUrl}/propriedades/${id}`, propriedadeData);
  }

  deletePropriedade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/propriedades/${id}`);
  }
}
