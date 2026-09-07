import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        // Placeholder temporal, puedes cambiarlo después
        loadComponent: () => import('./dashboard-placeholder/dashboard-placeholder.component').then(m => m.DashboardPlaceholderComponent)
      },
      {
        path: 'contratos',
        loadComponent: () => import('./contratos/contratos').then(m => m.ContratosComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
