import { Routes } from '@angular/router';

import { AuthGuard } from './core/auth.guard';
import { permissionGuard } from './core/permission.guard';

import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';

export const routes: Routes = [
  // ✅ Público
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  // ✅ Zona privada con layout + AuthGuard
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      {
        path: 'admin',
        canActivate: [permissionGuard('admin.access')],
        loadComponent: () =>
          import('./pages/admin/admin.component').then((m) => m.AdminComponent),
      },

      {
        path: 'forbidden',
        loadComponent: () =>
          import('./pages/forbidden/forbidden.component').then(
            (m) => m.ForbiddenComponent
          ),
      },

      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/tasks/tasks.component').then((m) => m.TasksComponent),
      },
    ],
  },

  // ✅ 404
  { path: '**', redirectTo: 'dashboard' },
];