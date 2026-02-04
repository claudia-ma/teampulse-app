import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AuthService, User } from '../../core/auth.service';
import { TasksService, Task } from '../../core/tasks.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="min-height:100vh;font-family:system-ui;background:#f6f7fb;">
      <header style="background:#fff;border-bottom:1px solid #e5e7eb;">
        <div style="max-width:1100px;margin:0 auto;padding:16px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:12px;align-items:center;">
            <b style="font-size:18px;">TeamPulse</b>
            <span *ngIf="user" style="color:#6b7280;">
              {{ user.name }} · {{ user.role }}
            </span>
          </div>

          <nav style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            <a routerLink="/dashboard" style="text-decoration:none;">Dashboard</a>

            <!-- ✅ Tasks + badge pendientes -->
            <a routerLink="/tasks" style="text-decoration:none;display:inline-flex;gap:8px;align-items:center;">
              Tasks
              <span
                *ngIf="pendingCount > 0"
                style="
                  font-size:12px;
                  padding:2px 8px;
                  border-radius:999px;
                  background:#111827;
                  color:#fff;
                "
              >
                {{ pendingCount }}
              </span>
            </a>

            <!-- Solo admin ve esto -->
            <a *ngIf="auth.hasPermission('admin.access')"
               routerLink="/admin"
               style="text-decoration:none;">
              Admin
            </a>

            <button (click)="logout()" style="padding:8px 12px;">Logout</button>
          </nav>
        </div>
      </header>

      <main style="max-width:1100px;margin:0 auto;padding:24px;">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  pendingCount = 0;
  private sub?: Subscription;

  constructor(
    public auth: AuthService,
    private router: Router,
    private tasksApi: TasksService
  ) {}

  get user(): User | null {
    return this.auth.getUser();
  }

  ngOnInit(): void {
    // 1) carga inicial
    this.refreshPendingCount();

    // 2) refrescar badge cuando navegas (por si cambiaste statuses)
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.refreshPendingCount());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refreshPendingCount() {
    this.tasksApi.getTasks().subscribe({
      next: (tasks: Task[]) => {
        const list = Array.isArray(tasks) ? tasks : (tasks as any)?.data ?? [];
        this.pendingCount = (list as Task[]).filter(t => t.status === 'pending').length;
      },
      error: () => {
        // no bloquea UI
        this.pendingCount = 0;
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