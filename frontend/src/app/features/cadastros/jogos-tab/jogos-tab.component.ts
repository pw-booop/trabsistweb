import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CadastroStore } from '../../../core/cadastro.store';
import { JogoCadastro } from '../../../shared/models/cadastro.model';
import { StatusJogo } from '../../../shared/models/caravana.model';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { abrirConfirmacao } from '../../../shared/confirm-dialog/confirm-dialog.component';

const timesDiferentes: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const m = g.get('mandanteId')?.value;
  const v = g.get('visitanteId')?.value;
  return m && v && m === v ? { mesmoTime: true } : null;
};

// Jogo AGENDADO precisa ter data futura (base da RN01)
const agendadoFuturo: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const data = g.get('dataHora')?.value;
  return g.get('status')?.value === 'AGENDADO' && data && new Date(data) <= new Date()
    ? { agendadoPassado: true }
    : null;
};

@Component({
  selector: 'app-jogos-tab',
  imports: [
    DatePipe, ReactiveFormsModule, MatDialogModule, MatSnackBarModule, MatTableModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, StatusBadgeComponent,
  ],
  template: `
    @if (editando() === null) {
      <div class="cad-barra">
        <span>{{ store.jogos().length }} jogo(s)</span>
        <button mat-flat-button (click)="novo()"><mat-icon>add</mat-icon> Novo jogo</button>
      </div>

      <div class="cad-tabela">
        <table mat-table [dataSource]="linhas()">
          <ng-container matColumnDef="partida">
            <th mat-header-cell *matHeaderCellDef>Partida</th>
            <td mat-cell *matCellDef="let j">
              {{ store.nomeTime(j.mandanteId) }} x {{ store.nomeTime(j.visitanteId) }}
            </td>
          </ng-container>
          <ng-container matColumnDef="data">
            <th mat-header-cell *matHeaderCellDef>Data</th>
            <td mat-cell *matCellDef="let j">{{ j.dataHora | date: 'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>
          <ng-container matColumnDef="estadio">
            <th mat-header-cell *matHeaderCellDef>Estádio</th>
            <td mat-cell *matCellDef="let j">{{ store.nomeEstadio(j.estadioId) }}</td>
          </ng-container>
          <ng-container matColumnDef="campeonato">
            <th mat-header-cell *matHeaderCellDef>Campeonato</th>
            <td mat-cell *matCellDef="let j">{{ j.campeonato }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let j"><app-status-badge [status]="j.status" /></td>
          </ng-container>
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let j">
              <button mat-icon-button (click)="editar(j)" aria-label="Editar jogo">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="excluir(j)" aria-label="Excluir jogo">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="cad-vazio" [attr.colspan]="colunas.length">Nenhum jogo cadastrado.</td>
          </tr>
        </table>
      </div>
    } @else {
      <mat-card appearance="outlined" class="cad-card">
        <h2>{{ editando() === 'novo' ? 'Novo jogo' : 'Editar jogo' }}</h2>
        <form class="cad-form" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <div class="cad-linha">
            <mat-form-field appearance="outline">
              <mat-label>Mandante</mat-label>
              <mat-select formControlName="mandanteId">
                @for (t of store.times(); track t.id) {
                  <mat-option [value]="t.id">{{ t.nome }}</mat-option>
                }
              </mat-select>
              <mat-error>Selecione o mandante</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Visitante</mat-label>
              <mat-select formControlName="visitanteId">
                @for (t of store.times(); track t.id) {
                  <mat-option [value]="t.id">{{ t.nome }}</mat-option>
                }
              </mat-select>
              <mat-error>Selecione o visitante</mat-error>
            </mat-form-field>
          </div>

          @if (form.hasError('mesmoTime') && form.controls.visitanteId.touched) {
            <p class="cad-erro" role="alert">Mandante e visitante precisam ser times diferentes.</p>
          }

          <mat-form-field appearance="outline">
            <mat-label>Estádio</mat-label>
            <mat-select formControlName="estadioId">
              @for (e of store.estadios(); track e.id) {
                <mat-option [value]="e.id">{{ e.nome }} · {{ e.cidade }}</mat-option>
              }
            </mat-select>
            <mat-error>Selecione o estádio</mat-error>
          </mat-form-field>

          <div class="cad-linha">
            <mat-form-field appearance="outline">
              <mat-label>Data e hora</mat-label>
              <input matInput type="datetime-local" formControlName="dataHora">
              <mat-error>Informe a data e a hora</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="AGENDADO">Agendado</mat-option>
                <mat-option value="REALIZADO">Realizado</mat-option>
                <mat-option value="CANCELADO">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (form.hasError('agendadoPassado') && form.controls.dataHora.touched) {
            <p class="cad-erro" role="alert">
              Jogo agendado precisa ter data futura. Para jogos passados, use "Realizado".
            </p>
          }

          <mat-form-field appearance="outline">
            <mat-label>Campeonato</mat-label>
            <input matInput formControlName="campeonato" autocomplete="off">
            <mat-error>Informe o campeonato</mat-error>
          </mat-form-field>

          <div class="cad-rodape">
            <button mat-button type="button" (click)="cancelar()">Cancelar</button>
            <button mat-flat-button type="submit">Salvar</button>
          </div>
        </form>
      </mat-card>
    }
  `,
})
export class JogosTabComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  store = inject(CadastroStore);

  colunas = ['partida', 'data', 'estadio', 'campeonato', 'status', 'acoes'];
  editando = signal<number | 'novo' | null>(null);

  linhas = computed(() =>
    [...this.store.jogos()].sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
  );

  form = this.fb.group(
    {
      mandanteId: this.fb.control<number | null>(null, Validators.required),
      visitanteId: this.fb.control<number | null>(null, Validators.required),
      estadioId: this.fb.control<number | null>(null, Validators.required),
      dataHora: this.fb.nonNullable.control('', Validators.required),
      campeonato: this.fb.nonNullable.control('', Validators.required),
      status: this.fb.nonNullable.control<StatusJogo>('AGENDADO'),
    },
    { validators: [timesDiferentes, agendadoFuturo] },
  );

  novo() {
    this.form.reset();
    this.editando.set('novo');
  }

  editar(j: JogoCadastro) {
    this.form.reset({
      mandanteId: j.mandanteId,
      visitanteId: j.visitanteId,
      estadioId: j.estadioId,
      dataHora: j.dataHora.slice(0, 16),
      campeonato: j.campeonato,
      status: j.status,
    });
    this.editando.set(j.id);
  }

  cancelar() {
    this.editando.set(null);
  }

  salvar() {
    const alvo = this.editando();
    if (alvo === null) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.store.salvarJogo(
      {
        mandanteId: v.mandanteId!,
        visitanteId: v.visitanteId!,
        estadioId: v.estadioId!,
        dataHora: v.dataHora,
        campeonato: v.campeonato.trim(),
        status: v.status,
      },
      alvo === 'novo' ? undefined : alvo,
    );
    this.snack.open(alvo === 'novo' ? 'Jogo criado' : 'Jogo atualizado', 'OK', { duration: 3000 });
    this.editando.set(null);
  }

  excluir(j: JogoCadastro) {
    const nome = `${this.store.nomeTime(j.mandanteId)} x ${this.store.nomeTime(j.visitanteId)}`;
    const motivo = this.store.bloqueioJogo(j.id); // RN12
    if (motivo) {
      this.snack.open(`Não é possível excluir ${nome}: ${motivo}`, 'OK', { duration: 6000 });
      return;
    }
    abrirConfirmacao(this.dialog, {
      titulo: 'Excluir jogo',
      mensagem: `Excluir ${nome}? Esta ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
    }).subscribe(ok => {
      if (!ok) return;
      this.store.removerJogo(j.id);
      this.snack.open('Jogo excluído', 'OK', { duration: 3000 });
    });
  }
}
