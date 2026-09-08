import { Routes } from '@angular/router';

export const PRECEPTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/preceptor-layout/preceptor-layout').then(m => m.PreceptorLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario/calendario').then(m => m.CalendarioComponent)
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./notificaciones/notificaciones').then(m => m.Notificaciones)
      },
      {
        path: 'cursos/:id',
        loadComponent: () => import('./cursos/cursos').then(m => m.CursoDetalleComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./configuracion/configuracion').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'crear-noticia',
        loadComponent: () => import('./crear-noticia/crear-noticia').then(m => m.CrearNoticiaComponent)
      },
      {
        path: 'informar',
        loadComponent: () => import('./informar/informar').then(m => m.InformarComponent)
      },
      {
        path: 'designar-rango',
        loadComponent: () => import('./designar-rango/designar-rango').then(m => m.DesignarRango)
      },
      {
        path: 'buscar-estudiante',
        loadComponent: () => import('./buscar-estudiante/buscar-estudiante').then(m => m.BuscarEstudianteComponent)
      },
      {
        path: 'buscar-docente',
        loadComponent: () => import('./buscar-docente/buscar-docente').then(m => m.BuscarDocenteComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
