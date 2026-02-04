import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 style="margin:0 0 10px;">Panel Admin</h1>
    <p>✅ Solo para admins.</p>
  `,
})
export class AdminComponent {}