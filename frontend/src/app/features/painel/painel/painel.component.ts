import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { PagamentoDialogComponent } from '../pagamento-dialog/pagamento-dialog.component';
import { CARAVANAS_MOCK } from '../../../shared/mocks/caravanas.mock';
import { InscricaoStore } from '../../../core/inscricao.store';
import { InscricaoResumo } from '../../../shared/models/inscricao.model';
import { StatusCaravana, StatusPagamento } from '../../../shared/models/caravana.model';
import { TRANSICOES } from '../../../shared/utils/pagamento';
import { statusDerivado } from '../../../shared/utils/caravana';

type Filtro = 'TODOS' | StatusPagamento;

@Component({
  selector: 'app-painel',
  imports: [
    CurrencyPipe, MatDialogModule, MatSnackBarModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatTableModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatButtonToggleModule, StatusBadgeComponent,
  ],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss',
})
export class PainelComponent {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private store = inject(InscricaoStore);

  caravanas = CARAVANAS_MOCK;
  colunas = ['passageiro', 'cpf', 'assento', 'pagamento', 'forma', 'valor', 'acoes'];

  selecionadaId = signal(CARAVANAS_MOCK[0].id);
  filtro = signal<Filtro>('TODOS');

  caravana = computed(() => this.caravanas.find(c => c.id === this.selecionadaId())!);

  inscricoes = computed(() =>
    this.store.inscricoes().filter(i => i.caravanaId === this.selecionadaId()),
  );

  // RN02: inscrições canceladas não ocupam vaga
  ativas = computed(() => this.inscricoes().filter(i => i.statusPagamento !== 'CANCELADO'));

  resumo = computed(() => {
    const c = this.caravana();
    const ativas = this.ativas();
    const pagas = ativas.filter(i => i.statusPagamento === 'PAGO');
    return {
      ocupadas: ativas.length,
      capacidade: c.capacidadeTotal,
      vagas: Math.max(c.capacidadeTotal - ativas.length, 0),
      ocupacao: c.capacidadeTotal ? (ativas.length / c.capacidadeTotal) * 100 : 0,
      pagos: pagas.length,
      pendentes: ativas.filter(i => i.statusPagamento === 'PENDENTE').length,
      arrecadado: pagas.reduce((soma, i) => soma + (i.valorPago ?? 0), 0),
      previsto: ativas.length * c.valorPorPessoa,
    };
  });

  // RN05: zerou as vagas -> LOTADA; liberou vaga -> volta para ABERTA.
  statusCaravana = computed<StatusCaravana>(() =>
    statusDerivado(this.caravana().status, this.resumo().vagas),
  );

  linhas = computed(() => {
    const f = this.filtro();
    return f === 'TODOS'
      ? this.inscricoes()
      : this.inscricoes().filter(i => i.statusPagamento === f);
  });

  podeAlterar(i: InscricaoResumo) {
    return TRANSICOES[i.statusPagamento].length > 0;
  }

  alterarPagamento(inscricao: InscricaoResumo) {
    const status = this.statusCaravana();
    const podeReativar =
      this.resumo().vagas > 0 && (status === 'ABERTA' || status === 'LOTADA');

    this.dialog
      .open(PagamentoDialogComponent, {
        data: { inscricao, valorCaravana: this.caravana().valorPorPessoa, podeReativar },
        width: '440px',
        maxWidth: '92vw',
      })
      .afterClosed()
      .subscribe(mudanca => {
        if (!mudanca) return;

        const antes = this.statusCaravana();
        this.store.atualizarPagamento(inscricao.id, mudanca); // SIMULADO
        const depois = this.statusCaravana();

        this.snack.open(
          antes === depois
            ? 'Pagamento atualizado'
            : `Pagamento atualizado. A caravana agora está ${depois.toLowerCase()}`,
          'OK',
          { duration: 4000 },
        );
      });
  }
}
