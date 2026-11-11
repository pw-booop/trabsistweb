import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'caravanas' },

      // Caravanas (a ordem importa: "nova" antes de ":id")
      {
        path: 'caravanas',
        loadComponent: () =>
          import('./features/caravanas/caravana-list/caravana-list.component').then(m => m.CaravanaListComponent),
      },
      {
        path: 'caravanas/nova',
        loadComponent: () =>
          import('./features/caravanas/caravana-form/caravana-form.component').then(m => m.CaravanaFormComponent),
      },
      {
        path: 'caravanas/:id',
        loadComponent: () =>
          import('./features/caravanas/caravana-detalhe/caravana-detalhe.component').then(m => m.CaravanaDetalheComponent),
      },
      {
        path: 'caravanas/:id/inscricao',
        loadComponent: () =>
          import('./features/caravanas/caravana-inscricao/caravana-inscricao.component').then(m => m.CaravanaInscricaoComponent),
      },

      // Passageiros
      {
        path: 'passageiros',
        loadComponent: () =>
          import('./features/passageiros/passageiro-list/passageiro-list.component').then(m => m.PassageiroListComponent),
      },
      {
        path: 'passageiros/novo',
        loadComponent: () =>
          import('./features/passageiros/passageiro-form/passageiro-form.component').then(m => m.PassageiroFormComponent),
      },
      {
        path: 'passageiros/:id/editar',
        loadComponent: () =>
          import('./features/passageiros/passageiro-form/passageiro-form.component').then(m => m.PassageiroFormComponent),
      },

      // Ingressos
      {
        path: 'ingressos',
        loadComponent: () =>
          import('./features/ingressos/ingresso-list/ingresso-list.component').then(m => m.IngressoListComponent),
      },
      {
        path: 'ingressos/novo',
        loadComponent: () =>
          import('./features/ingressos/ingresso-form/ingresso-form.component').then(m => m.IngressoFormComponent),
      },
      {
        path: 'ingressos/:id/editar',
        loadComponent: () =>
          import('./features/ingressos/ingresso-form/ingresso-form.component').then(m => m.IngressoFormComponent),
      },

      // Painel e cadastros de apoio
      {
        path: 'painel',
        loadComponent: () =>
          import('./features/painel/painel/painel.component').then(m => m.PainelComponent),
      },
      {
        path: 'cadastros',
        loadComponent: () =>
          import('./features/cadastros/cadastros/cadastros.component').then(m => m.CadastrosComponent),
      },
      { path: 'jogos', pathMatch: 'full', redirectTo: 'cadastros' },
    ],
  },
  { path: '**', redirectTo: '' },
];
