import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./general-login/general-login').then(m => m.GeneralLoginComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./admin-login/admin-login').then(m => m.AdminLogin)
  }
];
