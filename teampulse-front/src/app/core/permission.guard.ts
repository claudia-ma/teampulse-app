import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Permission } from './auth.service';

export const permissionGuard = (perm: Permission): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasPermission(perm)) return true;

    // ❌ No tiene permiso → 403
    return router.createUrlTree(['/forbidden']);
  };
};