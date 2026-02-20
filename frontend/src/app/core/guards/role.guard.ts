import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  return authService.currentUser.pipe(
    filter(user => user !== null), // Wait for user to be loaded
    take(1),
    map(user => {
      if (!user) { // Should not happen due to filter, but for type safety
        router.navigate(['/login']);
        return false;
      }
      
      if (user.type !== requiredRole) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
