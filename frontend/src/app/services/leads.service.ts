import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { Lead } from "../models";

@Injectable({
  providedIn: "root",
})
export class LeadsService {
  private apiUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/leads`).pipe(
      map((leads) =>
        leads.map((lead) => ({
          ...lead,
          total_area: Number(lead.total_area),
        }))
      )
    );
  }

  createLead(leadData: any): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/leads`, leadData);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leads/${id}`);
  }
}
