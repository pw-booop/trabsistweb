import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  isMobile = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map(r => r.matches)),
    { initialValue: false },
  );

  menu = [
    { path: '/caravanas', label: 'Caravanas', icon: 'directions_bus' },
    { path: '/passageiros', label: 'Passageiros', icon: 'groups' },
    { path: '/ingressos', label: 'Ingressos', icon: 'confirmation_number' },
    { path: '/painel', label: 'Painel', icon: 'dashboard' },
    { path: '/cadastros', label: 'Cadastros', icon: 'settings' },
  ];

  sair() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
