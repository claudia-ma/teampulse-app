import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService, User } from '../../core/auth.service';
import { DashboardService } from '../../core/dashboard.service';
import { TasksService, Task } from '../../core/tasks.service';

type SummaryResponse = {
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div>
        <h1 style="margin:0;">Dashboard</h1>
        <p style="margin:6px 0 0;color:#6b7280;">Vista privada · TeamPulse</p>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <a routerLink="/tasks"
           style="text-decoration:none;padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
          Ver Tasks
        </a>

        <a *ngIf="user?.role === 'admin'"
           routerLink="/admin"
           style="text-decoration:none;padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
          Ir a Admin
        </a>

        <button (click)="logout()"
                style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;">
          Logout
        </button>
      </div>
    </div>

    <div style="margin-top:18px;display:grid;gap:12px;">
      <!-- Sesión -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
        <h3 style="margin:0 0 10px;">Tu sesión</h3>

        <ng-container *ngIf="user; else loadingUser">
          <div style="display:grid;gap:6px;">
            <div><b>Nombre:</b> {{ user.name }}</div>
            <div><b>Email:</b> {{ user.email }}</div>
            <div><b>Rol:</b> {{ user.role }}</div>
          </div>

          <p style="margin:12px 0 0;color:#6b7280;font-size:14px;">
            <b>Origen:</b> {{ source }}
          </p>
        </ng-container>

        <ng-template #loadingUser>
          <p style="margin:0;color:#6b7280;">Cargando usuario...</p>
        </ng-template>
      </div>

      <!-- Estado API -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
        <h3 style="margin:0 0 10px;">Estado API</h3>

        <p style="margin:0;color:#6b7280;">
          Última comprobación: <b>{{ lastCheck || '—' }}</b>
        </p>

        <p *ngIf="apiError" style="margin:10px 0 0;color:#b00020;">
          {{ apiError }}
        </p>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button (click)="refreshMe()"
                  style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;">
            Refrescar /me
          </button>

          <button (click)="loadSummary()"
                  style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;">
            Refrescar resumen
          </button>

          <button (click)="loadTasksPreview()"
                  style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;">
            Refrescar preview tasks
          </button>
        </div>
      </div>

      <!-- ✅ Preview de tareas (TOP 3 por fecha) -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <h3 style="margin:0;">Mis tareas (preview)</h3>
          <span style="color:#6b7280;font-size:13px;">
            {{ tasksAt ? ('Actualizado: ' + tasksAt) : '' }}
          </span>
        </div>

        <p *ngIf="tasksError" style="margin:10px 0 0;color:#b00020;">{{ tasksError }}</p>

        <p *ngIf="tasksLoading" style="margin:10px 0 0;color:#6b7280;">Cargando tareas…</p>

        <ng-container *ngIf="!tasksLoading">
          <div *ngIf="tasksPreview.length; else emptyTasks" style="margin-top:12px;display:grid;gap:8px;">
            <div
              *ngFor="let t of tasksPreview"
              style="display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;"
            >
              <div style="display:flex;flex-direction:column;gap:2px;">
                <b>{{ t.title }}</b>
                <span style="color:#6b7280;font-size:13px;">
                  {{ t.assignee }} · Vence: {{ t.due }}
                </span>
              </div>

              <span
                style="font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid #e5e7eb;background:#fafafa;"
              >
                {{ t.status === 'done' ? '✅ Done' : '⏳ Pending' }}
              </span>
            </div>

            <a routerLink="/tasks" style="margin-top:10px;display:inline-block;color:#111827;">
              Ver todas →
            </a>
          </div>

          <ng-template #emptyTasks>
            <p style="margin:10px 0 0;color:#6b7280;">No hay tareas aún.</p>
          </ng-template>
        </ng-container>
      </div>

      <!-- Resumen -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <h3 style="margin:0;">Resumen</h3>
          <span style="color:#6b7280;font-size:13px;">
            {{ summaryAt ? ('Actualizado: ' + summaryAt) : '' }}
          </span>
        </div>

        <p *ngIf="summaryError" style="margin:10px 0 0;color:#b00020;">{{ summaryError }}</p>
        <p *ngIf="summaryLoading" style="margin:10px 0 0;color:#6b7280;">{{ summaryLoadingText }}</p>

        <ng-container *ngIf="summary && !summaryLoading">
          <div style="margin-top:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fafafa;">
              <div style="color:#6b7280;font-size:13px;">Tareas totales</div>
              <div style="font-size:22px;font-weight:700;">{{ summary.kpis.tasks_total }}</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fafafa;">
              <div style="color:#6b7280;font-size:13px;">Tareas hechas</div>
              <div style="font-size:22px;font-weight:700;">{{ summary.kpis.tasks_done }}</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fafafa;">
              <div style="color:#6b7280;font-size:13px;">Empleados</div>
              <div style="font-size:22px;font-weight:700;">{{ summary.kpis.employees }}</div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  source = 'localStorage';
  lastCheck = '';
  apiError = '';

  summary: SummaryResponse | null = null;
  summaryAt = '';
  summaryError = '';
  summaryLoadingText = 'Cargando resumen...';
  summaryLoading = false;

  // ✅ Tasks preview
  tasksPreview: Task[] = [];
  tasksAt = '';
  tasksError = '';
  tasksLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private dashboardApi: DashboardService,
    private tasksApi: TasksService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    this.source = 'localStorage';

    this.refreshMe();
    this.loadSummary();
    this.loadTasksPreview();
  }

  private normalizeDue(due: string) {
    if (!due) return due;
    return due.includes('T') ? due.split('T')[0] : due;
  }

  refreshMe() {
    this.apiError = '';

    this.auth.me().subscribe({
      next: (user) => {
        this.user = user;
        this.source = 'backend (/me)';
        this.lastCheck = new Date().toLocaleString();
      },
      error: (err) => {
        this.lastCheck = new Date().toLocaleString();
        this.apiError =
          err?.error?.message ||
          err?.message ||
          `Error al consultar /me (HTTP ${err?.status ?? '?'})`;
        console.error(err);
      },
    });
  }

  loadSummary() {
    this.summaryError = '';
    this.summaryLoading = true;
    this.summaryLoadingText = 'Cargando resumen...';

    this.dashboardApi.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.summaryAt = new Date().toLocaleString();
        this.summaryLoading = false;
      },
      error: (err) => {
        this.summaryLoading = false;
        this.summaryError =
          err?.error?.message ||
          err?.message ||
          `Error al consultar /dashboard/summary (HTTP ${err?.status ?? '?'})`;
        this.summaryLoadingText = 'No se pudo cargar el resumen.';
        console.error(err);
      },
    });
  }

  // ✅ TOP 3 tasks (por due asc) para preview en dashboard
  loadTasksPreview() {
    this.tasksError = '';
    this.tasksLoading = true;

    this.tasksApi.getTasks().subscribe({
      next: (tasks) => {
        const list = Array.isArray(tasks) ? tasks : (tasks as any)?.data ?? [];

        const cleaned = (list as Task[]).map(t => ({
          ...t,
          due: this.normalizeDue((t as any).due),
        }));

        // orden por due asc, y nos quedamos con 3
        this.tasksPreview = cleaned
          .slice()
          .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id - b.id))
          .slice(0, 3);

        this.tasksAt = new Date().toLocaleString();
        this.tasksLoading = false;
      },
      error: (err) => {
        this.tasksLoading = false;
        this.tasksError =
          err?.error?.message ||
          err?.message ||
          `Error al consultar /api/tasks (HTTP ${err?.status ?? '?'})`;
        console.error(err);
      },
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}