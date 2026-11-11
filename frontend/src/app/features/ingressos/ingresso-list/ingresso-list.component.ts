import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { VincularDialogComponent } from '../vincular-dialog/vincular-dialog.component';
import { IngressoStore } from '../../../core/ingresso.store';
import { JOGOS_MOCK } from '../../../shared/mocks/jogos.mock';
import { Ingresso, StatusIngresso } from '../../../shared/models/ingresso.model';

type Filtro = 'TODOS' | StatusIngresso;

@Component({
  selector: 'app-ingresso-list',
  imports: [
    CurrencyPipe, DatePipe, RouterLink, MatDialogModule, MatSnackBarModule, MatFormFieldModule,
    MatSelectModule, MatTableModule, MatButtonModule, MatButtonToggleModule,
    MatIconModule, StatusBadgeComponent,
  ],
  templateUrl: './ingresso-list.component.html',
  styleUrl: './ingresso-list.component.scss',
})
export class IngressoListComponent {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private store = inject(IngressoStore);

  // Só jogos que têm ingressos no mock
  jogos = JOGOS_MOCK.filter(j => j.status === 'AGENDADO');
  colunas = ['codigo', 'setor', 'valor', 'status', 'passageiro', 'acoes'];

  ingressos = this.store.ingressos;
  jogoId = signal(this.jogos[0].id);
  filtro = signal<Filtro>('TODOS');

  doJogo = computed(() => this.ingressos().filter(i => i.jogoId === this.jogoId()));

  contagem = computed(() => {
    const lista = this.doJogo();
    const conta = (s: StatusIngresso) => lista.filter(i => i.status === s).length;
    return {
      total: lista.length,
      disponiveis: conta('DISPONIVEL'),
      reservados: conta('RESERVADO'),
      vendidos: conta('VENDIDO'),
    };
  });

  linhas = computed(() => {
    const f = this.filtro();
    return f === 'TODOS' ? this.doJogo() : this.doJogo().filter(i => i.status === f);
  });

  // RN08: ingresso VENDIDO ou CANCELADO não pode ser vinculado
  podeVincular(i: Ingresso) {
    return i.status === 'DISPONIVEL' || i.status === 'RESERVADO';
  }

  podeEditar(i: Ingresso) {
    return i.status === 'DISPONIVEL' || i.status === 'RESERVADO';
  }

  vincular(ingresso: Ingresso) {
    this.dialog
      .open(VincularDialogComponent, { data: ingresso, width: '420px', maxWidth: '92vw' })
      .afterClosed()
      .subscribe(p => {
        if (!p) return;
        // SIMULADO: trocar por PATCH /api/ingressos/:id/vincular
        this.store.atualizar(ingresso.id, {
          status: 'VENDIDO', passageiroId: p.id, passageiroNome: p.nome,
        });
        this.snack.open(`${ingresso.codigo} vinculado a ${p.nome}`, 'OK', { duration: 3000 });
      });
  }
}
