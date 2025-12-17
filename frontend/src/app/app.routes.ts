import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'leads',
    pathMatch: 'full'
  },
  {
    path: 'leads',
    loadComponent: () => import('./components/leads/leads.component').then(m => m.LeadsComponent)
  },
  {
    path: 'propriedades-rurais',
    loadComponent: () => import('./components/propriedades/propriedades.component').then(m => m.PropriedadesComponent)
  }
];
