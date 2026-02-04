import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

export type DashboardSummary = {
  kpis: {
    tasks_total: number;
    tasks_done: number;
    employees: number;
  };
  recent: Array<{
    title: string;
    status: 'pending' | 'done' | string;
  }>;
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  getSummary() {
    return this.http.get<DashboardSummary>(
      `${this.api.baseUrl}/api/dashboard/summary`
    );
  }
}