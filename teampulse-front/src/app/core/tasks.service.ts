import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type TaskStatus = 'pending' | 'done';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  assignee: string;
  due: string; // YYYY-MM-DD
}

type TaskUpdateStatusPayload = {
  status: TaskStatus;
};

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.api.baseUrl}/api/tasks`);
  }

  // (Opcional para futuro)
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.api.baseUrl}/api/tasks/${id}`);
  }

  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    const payload: TaskUpdateStatusPayload = { status };
    return this.http.patch<Task>(`${this.api.baseUrl}/api/tasks/${id}`, payload);
  }
}