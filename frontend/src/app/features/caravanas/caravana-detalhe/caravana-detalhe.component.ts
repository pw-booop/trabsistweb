import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { CARAVANAS_MOCK } from '../../../shared/mocks/caravanas.mock';
import { ONIBUS_MOCK } from '../../../shared/mocks/onibus.mock';
import { InscricaoStore } from '../../../core/inscricao.store';
import { AuthService } from '../../../core/auth.service';
import { InscricaoResumo } from '../../../shared/models/inscricao.model';
import { statusDerivado } from '../../../shared/utils/caravana';

@Component({
  selector: 'app-caravana-detalhe',
  imports: [
    CurrencyPipe, DatePipe, RouterLink, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, StatusBadgeComponent,
  ],
  templateUrl: './caravana-detalhe.component.html',
  styleUrl: './caravana-detalhe.component.scss',
})
export class CaravanaDetalheComponent {
  private store = inject(InscricaoStore);
  private auth = inject(AuthService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  caravana = CARAVANAS_MOCK.find(c => c.id === this.id);
  onibus = ONIBUS_MOCK.filter(o => o.caravanaId === this.id);
  colunas = ['passageiro', 'onibus', 'assento', 'pagamento'];

  // Lista de inscritos só para ORGANIZADOR e ADMIN
  podeVerInscritos = computed(() =>
    ['ADMIN', 'ORGANIZADOR'].includes(this.auth.usuario()?.perfil ?? ''),
  );

  inscricoes = computed(() =>
    this.store.inscricoes().filter(i => i.caravanaId === this.id),
  );

  // RN02: canceladas não ocupam vaga
  ativas = computed(() => this.inscricoes().filter(i => i.statusPagamento !== 'CANCELADO'));

  capacidade = this.onibus.reduce((s, o) => s + o.capacidade, 0);
  vagas = computed(() => Math.max(this.capacidade - this.ativas().length, 0));

  status = computed(() => statusDerivado(this.caravana!.status, this.vagas()));
  podeInscrever = computed(() => this.status() === 'ABERTA' && this.vagas() > 0);

  onibusComOcupacao = computed(() =>
    this.onibus.map(o => {
      const ocupadas = this.ativas().filter(i => i.onibusId === o.id).length;
      return {
        ...o,
        ocupadas,
        vagas: Math.max(o.capacidade - ocupadas, 0),
        pct: o.capacidade ? (ocupadas / o.capacidade) * 100 : 0,
      };
    }),
  );

  semOnibus = computed(() => this.ativas().filter(i => i.onibusId === null).length);

  nomeOnibus(i: InscricaoResumo): string {
    const o = this.onibus.find(o => o.id === i.onibusId);
    return o ? `${o.empresa} · ${o.placa}` : '—';
  }
}
