import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ESTUDIANTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/portal-layout/portal-layout').then(m => m.PortalLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/estudiante-dashboard').then(m => m.EstudianteDashboardComponent)
      },
      {
        path: 'clases/:id',
        loadComponent: () => import('../../shared/ui/clase-detalle/clase-detalle').then(m => m.ClaseDetalleComponent)
      },
      {
        path: 'calendario',
        loadComponent: () => import('../preceptores/calendario/calendario').then(m => m.CalendarioComponent)
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('../preceptores/notificaciones/notificaciones').then(m => m.Notificaciones)
      },
      {
        path: 'crear-noticia',
        canActivate: [authGuard],
        data: { requiresDelegado: true },
        loadComponent: () => import('../preceptores/crear-noticia/crear-noticia').then(m => m.CrearNoticiaComponent)
      },
      {
        path: 'chat',
        canActivate: [authGuard],
        data: { requiresDelegado: true },
        loadComponent: () => import('../preceptores/informar/informar').then(m => m.InformarComponent)
      },
      {
        path: 'informar',
        redirectTo: 'chat',
        pathMatch: 'full'
      },
      {
        path: 'configuracion',
        loadComponent: () => import('../preceptores/configuracion/configuracion').then(m => m.ConfiguracionComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
