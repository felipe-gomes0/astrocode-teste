import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  return authService.currentUser.pipe(
    map(user => {
      if (!user || user.type !== requiredRole) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
