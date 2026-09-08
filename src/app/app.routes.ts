import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'estudiantes',
    canActivate: [authGuard],
    data: { role: 'estudiante' },
    loadChildren: () => import('./features/estudiantes/estudiantes.routes').then(m => m.ESTUDIANTES_ROUTES)
  },
  {
    path: 'docentes',
    canActivate: [authGuard],
    data: { role: 'docente' },
    loadChildren: () => import('./features/docentes/docentes.routes').then(m => m.DOCENTES_ROUTES)
  },
  {
    path: 'tutores',
    canActivate: [authGuard],
    data: { role: 'tutor' },
    loadChildren: () => import('./features/tutores/tutores.routes').then(m => m.TUTORES_ROUTES)
  },
  {
    path: 'preceptores',
    canActivate: [authGuard],
    data: { role: 'preceptor' },
    loadChildren: () => import('./features/preceptores/preceptores.routes').then(m => m.PRECEPTORES_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
