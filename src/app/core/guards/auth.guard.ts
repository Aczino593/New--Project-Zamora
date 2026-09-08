import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado, lo envía al login
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const userRole = authService.getRole();

  // Comprobar si la ruta requiere un rol específico (puede ser string o array)
  const expectedRole = route.data['role'];
  if (expectedRole) {
    if (Array.isArray(expectedRole)) {
      if (!expectedRole.includes(userRole)) {
        router.navigate(['/auth/login']);
        return false;
      }
    } else if (userRole !== expectedRole) {
      router.navigate(['/auth/login']);
      return false;
    }
  }

  // Comprobar si requiere ser delegado (para estudiantes en apartado informar)
  const requiresDelegado = route.data['requiresDelegado'];
  if (requiresDelegado && userRole === 'estudiante' && !authService.isDelegado()) {
    router.navigate(['/estudiantes/dashboard']);
    return false;
  }

  return true;
};
