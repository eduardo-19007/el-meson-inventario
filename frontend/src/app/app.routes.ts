import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'productos', loadComponent: () => import('./features/products/products.page').then((m) => m.ProductsPage) },
      { path: 'movimientos', loadComponent: () => import('./features/movements/movements.page').then((m) => m.MovementsPage) },
      { path: 'administracion', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage) }
    ]
  },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) }
];
