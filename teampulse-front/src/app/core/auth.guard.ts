import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ✅ Si hay token, dejamos pasar
  if (auth.getToken()) {
    return true;
  }

  // ❌ Si no hay token, fuera
  return router.createUrlTree(['/login']);
};