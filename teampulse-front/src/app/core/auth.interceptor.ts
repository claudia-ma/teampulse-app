// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No añadimos Authorization al login (ni a assets, si los hubiera)
  if (req.url.includes('/api/auth/login')) return next(req);

  const token = localStorage.getItem('token');

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};