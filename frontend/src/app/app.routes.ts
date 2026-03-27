import { Routes } from '@angular/router';
import { App } from './app';
import { homeGuard } from './shared/guards';
import { HomePage } from './components/home-page/home-page';

export const routes: Routes = [
  {
    path: '',
    component: App,
    pathMatch: 'full',
    children: [{ path: '', component: HomePage, canActivate: [homeGuard] }],
  },
  { path: 'welcome', loadComponent: () => import('./components/welcome-page/welcome-page').then((m) => m.WelcomePage) },
  { path: 'widget/:id', loadComponent: () => import('./components/widget-page/widget-page').then((m) => m.WidgetPage) },
  { path: '**', redirectTo: '' },
];
