import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado, lo patea al login general
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Comprobar si la ruta requiere un rol específico
  const expectedRole = route.data['role'];
  if (expectedRole && authService.getRole() !== expectedRole) {
    // Si intenta entrar a una zona que no le corresponde (ej. estudiante en zona preceptor)
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
