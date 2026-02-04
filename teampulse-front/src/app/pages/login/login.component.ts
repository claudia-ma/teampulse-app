import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:420px;margin:60px auto;font-family:system-ui;">
      <h2 style="margin:0 0 12px;">TeamPulse · Login</h2>

      <p *ngIf="info"
         style="background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:10px;border-radius:10px;margin:0 0 12px;">
        {{ info }}
      </p>

      <form (ngSubmit)="submit()" novalidate style="display:grid;gap:10px;">
        <input
          [(ngModel)]="email"
          name="email"
          required
          placeholder="Email"
          autocomplete="email"
          style="padding:10px;"
        />

        <input
          [(ngModel)]="password"
          name="password"
          type="password"
          required
          placeholder="Password"
          autocomplete="current-password"
          style="padding:10px;"
        />

        <button type="submit" [disabled]="loading" style="padding:10px;">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>

        <p *ngIf="error" style="color:#b00020;margin:0;">
          {{ error }}
        </p>
      </form>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  email = 'admin@teampulse.com';
  password = 'password123';

  loading = false;
  error = '';
  info = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.info = 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
    }
  }

  submit(): void {
  this.loading = true;
  this.error = '';
  this.info = '';

  const email = this.email.trim();

  this.auth.login(email, this.password).subscribe({
    next: (res) => {
      // ✅ aseguramos que el token ya está en localStorage (por si acaso)
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      const role = res.user.role;

      // ✅ “tick” para que el interceptor lo pille seguro en la primera request
      setTimeout(() => {
        this.loading = false;
        this.router.navigateByUrl(role === 'admin' ? '/admin' : '/dashboard');
      }, 0);
    },
    error: (err) => {
      this.loading = false;
      this.error =
        err?.error?.message ||
        'Credenciales incorrectas';
    },
  });
}
}