import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="max-width:700px;margin:40px auto;font-family:system-ui;">
      <h1 style="margin:0 0 10px;">403 · Forbidden</h1>
      <p style="margin:0 0 16px;">Acceso denegado.</p>

      <div style="display:flex;gap:10px;">
        <button (click)="goBack()" style="padding:10px 12px;">Volver</button>
        <a routerLink="/dashboard" style="padding:10px 12px;text-decoration:none;border:1px solid #ddd;">
          Ir a Dashboard
        </a>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}