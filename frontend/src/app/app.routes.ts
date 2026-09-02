import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePage, pathMatch: 'full' },
  { path: 'widget/:id', loadComponent: () => import('./components/widget-page/widget-page').then((m) => m.WidgetPage) },
  { path: '**', redirectTo: '' },
];
