import { Routes } from '@angular/router';

export const DOCENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/portal-layout/portal-layout').then(m => m.PortalLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/docente-dashboard').then(m => m.DocenteDashboardComponent)
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
        path: 'informar',
        loadComponent: () => import('../preceptores/informar/informar').then(m => m.InformarComponent)
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
