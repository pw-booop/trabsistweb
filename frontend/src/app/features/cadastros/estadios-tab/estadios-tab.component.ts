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
import { Estadio } from '../../../shared/models/estadio.model';
import { abrirConfirmacao } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-estadios-tab',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatSnackBarModule, MatTableModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
    @if (editando() === null) {
      <div class="cad-barra">
        <span>{{ store.estadios().length }} estádio(s)</span>
        <button mat-flat-button (click)="novo()"><mat-icon>add</mat-icon> Novo estádio</button>
      </div>

      <div class="cad-tabela">
        <table mat-table [dataSource]="store.estadios()">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let e">{{ e.nome }}</td>
          </ng-container>
          <ng-container matColumnDef="cidade">
            <th mat-header-cell *matHeaderCellDef>Cidade</th>
            <td mat-cell *matCellDef="let e">{{ e.cidade }}/{{ e.uf }}</td>
          </ng-container>
          <ng-container matColumnDef="capacidade">
            <th mat-header-cell *matHeaderCellDef>Capacidade</th>
            <td mat-cell *matCellDef="let e">{{ e.capacidade }}</td>
          </ng-container>
          <ng-container matColumnDef="jogos">
            <th mat-header-cell *matHeaderCellDef>Jogos</th>
            <td mat-cell *matCellDef="let e">{{ store.qtdJogosDoEstadio(e.id) }}</td>
          </ng-container>
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button (click)="editar(e)" aria-label="Editar estádio">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="excluir(e)" aria-label="Excluir estádio">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="cad-vazio" [attr.colspan]="colunas.length">Nenhum estádio cadastrado.</td>
          </tr>
        </table>
      </div>
    } @else {
      <mat-card appearance="outlined" class="cad-card">
        <h2>{{ editando() === 'novo' ? 'Novo estádio' : 'Editar estádio' }}</h2>
        <form class="cad-form" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="nome" autocomplete="off">
            @if (form.controls.nome.hasError('required')) {
              <mat-error>Informe o nome</mat-error>
            } @else if (form.controls.nome.hasError('minlength')) {
              <mat-error>Mínimo de 3 caracteres</mat-error>
            }
          </mat-form-field>

          <div class="cad-linha">
            <mat-form-field appearance="outline">
              <mat-label>Cidade</mat-label>
              <input matInput formControlName="cidade" autocomplete="off">
              <mat-error>Informe a cidade</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>UF</mat-label>
              <input matInput formControlName="uf" maxlength="2" autocomplete="off">
              @if (form.controls.uf.hasError('required')) {
                <mat-error>Informe a UF</mat-error>
              } @else if (form.controls.uf.hasError('pattern')) {
                <mat-error>Use 2 letras (ex.: BA)</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Capacidade</mat-label>
            <input matInput type="number" inputmode="numeric" formControlName="capacidade">
            @if (form.controls.capacidade.hasError('required')) {
              <mat-error>Informe a capacidade</mat-error>
            } @else {
              <mat-error>Use um número inteiro maior que zero</mat-error>
            }
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
export class EstadiosTabComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  store = inject(CadastroStore);

  colunas = ['nome', 'cidade', 'capacidade', 'jogos', 'acoes'];
  editando = signal<number | 'novo' | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cidade: ['', Validators.required],
    uf: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
    capacidade: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
  });

  novo() {
    this.form.reset();
    this.editando.set('novo');
  }

  editar(e: Estadio) {
    this.form.reset({ nome: e.nome, cidade: e.cidade, uf: e.uf, capacidade: e.capacidade });
    this.editando.set(e.id);
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
    this.store.salvarEstadio(
      {
        nome: v.nome.trim(),
        cidade: v.cidade.trim(),
        uf: v.uf.toUpperCase(),
        capacidade: v.capacidade!,
      },
      alvo === 'novo' ? undefined : alvo,
    );
    this.snack.open(alvo === 'novo' ? 'Estádio criado' : 'Estádio atualizado', 'OK', { duration: 3000 });
    this.editando.set(null);
  }

  excluir(e: Estadio) {
    const motivo = this.store.bloqueioEstadio(e.id); // RN12
    if (motivo) {
      this.snack.open(`Não é possível excluir ${e.nome}: ${motivo}`, 'OK', { duration: 6000 });
      return;
    }
    abrirConfirmacao(this.dialog, {
      titulo: 'Excluir estádio',
      mensagem: `Excluir ${e.nome}? Esta ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
    }).subscribe(ok => {
      if (!ok) return;
      this.store.removerEstadio(e.id);
      this.snack.open('Estádio excluído', 'OK', { duration: 3000 });
    });
  }
}
