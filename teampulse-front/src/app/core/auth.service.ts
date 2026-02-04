import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { catchError, finalize, map, of, tap } from 'rxjs';

export type Role = 'admin' | 'employee';

export type Permission =
  | 'admin.access'
  | 'users.read'
  | 'users.write'
  | 'tasks.read'
  | 'tasks.write';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions?: Permission[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  constructor(private http: HttpClient, private api: ApiService) {}

  // =========================
  // Auth API
  // =========================
  login(email: string, password: string) {
  return this.http
    .post<LoginResponse>(`${this.api.baseUrl}/api/auth/login`, { email, password })
    .pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token); // <- token
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
      })
    );
}

  logout() {
    return this.http.post(`${this.api.baseUrl}/api/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => this.clearSession())
    );
  }

  me() {
    return this.http.get<User>(`${this.api.baseUrl}/api/auth/me`).pipe(
      tap((user) => localStorage.setItem(this.userKey, JSON.stringify(user)))
    );
  }

  refreshMe() {
    if (!this.getToken()) return of(false);

    return this.me().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // =========================
  // Storage helpers
  // =========================
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  getStoredUser(): User | null {
    return this.getUser();
  }

  getRole(): Role | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // =========================
  // Permisos finos
  // =========================
  getPermissions(): Permission[] {
    const user = this.getUser();
    if (!user) return [];

    if (user.permissions?.length) return user.permissions;

    if (user.role === 'admin') {
      return [
        'admin.access',
        'users.read',
        'users.write',
        'tasks.read',
        'tasks.write',
      ];
    }

    return ['tasks.read'];
  }

  hasPermission(permission: Permission): boolean {
    return this.getPermissions().includes(permission);
  }
}