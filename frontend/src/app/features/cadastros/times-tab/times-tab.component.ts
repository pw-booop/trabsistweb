import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CadastroStore } from '../../../core/cadastro.store';
import { TimeCadastro } from '../../../shared/models/cadastro.model';
import { abrirConfirmacao } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-times-tab',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatSnackBarModule, MatTableModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
    @if (editando() === null) {
      <div class="cad-barra">
        <span>{{ store.times().length }} time(s)</span>
        <button mat-flat-button (click)="novo()"><mat-icon>add</mat-icon> Novo time</button>
      </div>

      <div class="cad-tabela">
        <table mat-table [dataSource]="store.times()">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let t">{{ t.nome }}</td>
          </ng-container>
          <ng-container matColumnDef="sigla">
            <th mat-header-cell *matHeaderCellDef>Sigla</th>
            <td mat-cell *matCellDef="let t">{{ t.sigla }}</td>
          </ng-container>
          <ng-container matColumnDef="cidade">
            <th mat-header-cell *matHeaderCellDef>Cidade</th>
            <td mat-cell *matCellDef="let t">{{ t.cidade }}</td>
          </ng-container>
          <ng-container matColumnDef="jogos">
            <th mat-header-cell *matHeaderCellDef>Jogos</th>
            <td mat-cell *matCellDef="let t">{{ store.qtdJogosDoTime(t.id) }}</td>
          </ng-container>
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <button mat-icon-button (click)="editar(t)" aria-label="Editar time">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="excluir(t)" aria-label="Excluir time">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="cad-vazio" [attr.colspan]="colunas.length">Nenhum time cadastrado.</td>
          </tr>
        </table>
      </div>
    } @else {
      <mat-card appearance="outlined" class="cad-card">
        <h2>{{ editando() === 'novo' ? 'Novo time' : 'Editar time' }}</h2>
        <form class="cad-form" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="nome" autocomplete="off">
            @if (form.controls.nome.hasError('required')) {
              <mat-error>Informe o nome</mat-error>
            } @else if (form.controls.nome.hasError('minlength')) {
              <mat-error>Mínimo de 2 caracteres</mat-error>
            }
          </mat-form-field>

          <div class="cad-linha">
            <mat-form-field appearance="outline">
              <mat-label>Sigla</mat-label>
              <input matInput formControlName="sigla" maxlength="4" autocomplete="off">
              @if (form.controls.sigla.hasError('required')) {
                <mat-error>Informe a sigla</mat-error>
              } @else if (form.controls.sigla.hasError('pattern')) {
                <mat-error>Use de 2 a 4 letras</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cidade</mat-label>
              <input matInput formControlName="cidade" autocomplete="off">
              <mat-error>Informe a cidade</mat-error>
            </mat-form-field>
          </div>

          <div class="cad-rodape">
            <button mat-button type="button" (click)="cancelar()">Cancelar</button>
            <button mat-flat-button type="submit">Salvar</button>
          </div>
        </form>
      </mat-card>
    }
  `,
})
export class TimesTabComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  store = inject(CadastroStore);

  colunas = ['nome', 'sigla', 'cidade', 'jogos', 'acoes'];
  editando = signal<number | 'novo' | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    sigla: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2,4}$/)]],
    cidade: ['', Validators.required],
  });

  novo() {
    this.form.reset();
    this.editando.set('novo');
  }

  editar(t: TimeCadastro) {
    this.form.reset({ nome: t.nome, sigla: t.sigla, cidade: t.cidade });
    this.editando.set(t.id);
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
    this.store.salvarTime(
      { nome: v.nome.trim(), sigla: v.sigla.toUpperCase(), cidade: v.cidade.trim() },
      alvo === 'novo' ? undefined : alvo,
    );
    this.snack.open(alvo === 'novo' ? 'Time criado' : 'Time atualizado', 'OK', { duration: 3000 });
    this.editando.set(null);
  }

  excluir(t: TimeCadastro) {
    const motivo = this.store.bloqueioTime(t.id); // RN12
    if (motivo) {
      this.snack.open(`Não é possível excluir ${t.nome}: ${motivo}`, 'OK', { duration: 6000 });
      return;
    }
    abrirConfirmacao(this.dialog, {
      titulo: 'Excluir time',
      mensagem: `Excluir ${t.nome}? Esta ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
    }).subscribe(ok => {
      if (!ok) return;
      this.store.removerTime(t.id);
      this.snack.open('Time excluído', 'OK', { duration: 3000 });
    });
  }
}
