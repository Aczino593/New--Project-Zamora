import { Routes } from '@angular/router';

export const TUTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/portal-layout/portal-layout').then(m => m.PortalLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/tutor-dashboard').then(m => m.TutorDashboardComponent)
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
