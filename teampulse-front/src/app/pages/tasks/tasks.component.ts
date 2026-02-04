import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { TasksService, Task, TaskStatus } from '../../core/tasks.service';

type DueTag = { label: string; className: string };

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .wrap { display:grid; gap:12px; }
    .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
    .top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .muted { color:#6b7280; }
    .filters { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .chip {
      padding:6px 10px;
      border:1px solid #e5e7eb;
      background:#fff;
      border-radius:999px;
      cursor:pointer;
      font-size:13px;
    }
    .chipActive { border-color:#111827; }
    .list { display:grid; gap:10px; margin-top:12px; }
    .row {
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      border:1px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff;
    }
    .left { display:flex; flex-direction:column; gap:3px; }
    .badge {
      font-size:12px;
      padding:4px 10px;
      border-radius:999px;
      border:1px solid;
      white-space:nowrap;
    }
    .done { background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }
    .pending { background:#fff7ed; border-color:#fed7aa; color:#9a3412; }

    .tag {
      font-size:12px;
      padding:4px 10px;
      border-radius:999px;
      border:1px solid;
      white-space:nowrap;
      margin-right:6px;
    }
    .tagToday { background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
    .tagTomorrow { background:#f0fdf4; border-color:#bbf7d0; color:#166534; }
    .tagOverdue { background:#fef2f2; border-color:#fecaca; color:#991b1b; }

    .btn {
      padding:8px 12px;
      border:1px solid #e5e7eb;
      border-radius:10px;
      background:#fff;
      cursor:pointer;
    }
    .btnSmall {
      padding:6px 10px;
      border:1px solid #e5e7eb;
      border-radius:10px;
      background:#fff;
      cursor:pointer;
      font-size:13px;
    }
  `],
  template: `
    <div class="wrap">
      <div class="top">
        <div>
          <h1>Mis tareas</h1>
          <!-- <p class="muted">GET /api/tasks · PATCH /api/tasks/:id</p> -->
        </div>

        <button class="btn" (click)="load()" [disabled]="loading">
          {{ loading ? 'Cargando…' : 'Refrescar' }}
        </button>
      </div>

      <div class="card">
        <div class="filters">
          <button class="chip" [class.chipActive]="filter==='all'" (click)="setFilter('all')">Todas</button>
          <button class="chip" [class.chipActive]="filter==='pending'" (click)="setFilter('pending')">Pendientes</button>
          <button class="chip" [class.chipActive]="filter==='done'" (click)="setFilter('done')">Hechas</button>
        </div>

        <p *ngIf="loading" class="muted">Cargando tareas…</p>

        <div class="list" *ngIf="!loading">
          <div class="row" *ngFor="let t of filtered">
            <div class="left">
              <b>{{ t.title }}</b>
              <span class="muted">Asignada a {{ t.assignee }} · Vence {{ t.due }}</span>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <span *ngIf="t._dueTag?.label" class="tag" [ngClass]="t._dueTag?.className">
                {{ t._dueTag?.label }}
              </span>

              <span class="badge" [class.done]="t.status==='done'" [class.pending]="t.status==='pending'">
                {{ t.status }}
              </span>

              <button class="btnSmall" (click)="toggleStatus(t)">
                {{ t.status === 'done' ? 'Volver' : 'Marcar done' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TasksComponent implements OnInit {
  filter: 'all' | TaskStatus = 'all';
  tasks: (Task & { _dueTag?: DueTag })[] = [];
  loading = false;

  constructor(private tasksApi: TasksService) {}

  ngOnInit(): void {
    setTimeout(() => this.load(), 0);
  }

  setFilter(f: 'all' | TaskStatus) {
    this.filter = f;
  }

  get filtered() {
    const sorted = [...this.tasks].sort((a, b) => a.due.localeCompare(b.due));
    if (this.filter === 'all') {
      return [...sorted.filter(t => t.status === 'pending'), ...sorted.filter(t => t.status === 'done')];
    }
    return sorted.filter(t => t.status === this.filter);
  }

  load() {
    this.loading = true;

    this.tasksApi.getTasks().pipe(
      finalize(() => (this.loading = false))
    ).subscribe(data => {
      this.tasks = data.map(t => ({
        ...t,
        due: t.due.split('T')[0],
        _dueTag: this.calcDueTag(t),
      }));
    });
  }

  toggleStatus(task: Task & { _dueTag?: DueTag }) {
    const next = task.status === 'done' ? 'pending' : 'done';
    task.status = next;
    task._dueTag = this.calcDueTag(task);

    this.tasksApi.updateStatus(task.id, next).subscribe(updated => {
      task.status = updated.status;
      task.due = updated.due.split('T')[0];
      task._dueTag = this.calcDueTag(task);
    });
  }

  private calcDueTag(task: Task): DueTag {
    const today = new Date().toISOString().split('T')[0];
    if (task.status === 'done') return { label: '', className: '' };
    if (task.due < today) return { label: 'Atrasada', className: 'tagOverdue' };
    if (task.due === today) return { label: 'Vence hoy', className: 'tagToday' };
    return { label: '', className: '' };
  }
}