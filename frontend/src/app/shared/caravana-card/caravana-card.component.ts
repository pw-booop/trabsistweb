import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CaravanaResumo } from '../models/caravana.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-caravana-card',
  imports: [
    CurrencyPipe, DatePipe, RouterLink, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressBarModule, StatusBadgeComponent,
  ],
  templateUrl: './caravana-card.component.html',
  styleUrl: './caravana-card.component.scss',
})
export class CaravanaCardComponent {
  caravana = input.required<CaravanaResumo>();

  vagas = computed(() => {
    const c = this.caravana();
    return Math.max(c.capacidadeTotal - c.inscricoesAtivas, 0);
  });

  ocupacao = computed(() => {
    const c = this.caravana();
    return c.capacidadeTotal ? (c.inscricoesAtivas / c.capacidadeTotal) * 100 : 0;
  });

  podeInscrever = computed(() => this.caravana().status === 'ABERTA' && this.vagas() > 0);
}
