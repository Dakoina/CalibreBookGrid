import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'covers' },
  { path: 'covers', loadComponent: () => import('./features/covers/covers.component') },
  { path: 'covers-extended', loadComponent: () => import('./features/extended-covers/extended-covers.component') },
  { path: 'titles', loadComponent: () => import('./features/titles/titles.component') },
  { path: 'series', loadComponent: () => import('./features/series/series.component') },
  { path: '**', redirectTo: 'covers' },
];
