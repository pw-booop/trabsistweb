import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { FormaPagamento, InscricaoResumo } from '../../../shared/models/inscricao.model';
import { StatusPagamento } from '../../../shared/models/caravana.model';
import { ACAO, TRANSICOES } from '../../../shared/utils/pagamento';
import { MudancaPagamento } from '../../../core/inscricao.store';

export interface PagamentoDialogData {
  inscricao: InscricaoResumo;
  valorCaravana: number;
  podeReativar: boolean; // só há vaga se vagas > 0 e a caravana ainda aceita inscrição
}

@Component({
  selector: 'app-pagamento-dialog',
  imports: [
    CurrencyPipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, StatusBadgeComponent,
  ],
  template: `
    <h2 mat-dialog-title>Pagamento</h2>

    <mat-dialog-content>
      <div class="cabecalho">
        <strong>{{ dados.inscricao.passageiroNome }}</strong>
        <app-status-badge [status]="dados.inscricao.statusPagamento" />
      </div>

      @if (opcoes.length === 0) {
        <p class="aviso">
          <mat-icon>lock</mat-icon>
          Inscrição reembolsada: não há mais alterações possíveis.
        </p>
      } @else {
        <form [formGroup]="form" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Nova situação</mat-label>
            <mat-select formControlName="status">
              @for (o of opcoes; track o) {
                <mat-option [value]="o" [disabled]="o === 'PENDENTE' && !dados.podeReativar">
                  {{ acao[o] }}
                </mat-option>
              }
            </mat-select>
            @if (!dados.podeReativar && dados.inscricao.statusPagamento === 'CANCELADO') {
              <mat-hint>Sem vagas para reativar esta inscrição</mat-hint>
            }
            <mat-error>Selecione uma opção</mat-error>
          </mat-form-field>

          @if (status() === 'PAGO') {
            <mat-form-field appearance="outline">
              <mat-label>Forma de pagamento</mat-label>
              <mat-select formControlName="forma">
                <mat-option value="PIX">Pix</mat-option>
                <mat-option value="DINHEIRO">Dinheiro</mat-option>
                <mat-option value="CARTAO">Cartão</mat-option>
              </mat-select>
              <mat-error>Informe a forma de pagamento</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor recebido</mat-label>
              <span matTextPrefix>R$&nbsp;</span>
              <input matInput type="number" inputmode="decimal" step="0.01" formControlName="valor">
              <mat-hint>Valor da caravana: {{ dados.valorCaravana | currency: 'BRL' }}</mat-hint>
              <mat-error>Informe um valor maior que zero</mat-error>
            </mat-form-field>
          }

          @if (status() === 'CANCELADO') {
            <p class="aviso">
              <mat-icon>warning</mat-icon>
              O assento será liberado e a vaga volta para a caravana.
            </p>
          }

          @if (status() === 'REEMBOLSADO') {
            <p class="aviso">
              <mat-icon>warning</mat-icon>
              Reembolsada, a inscrição não poderá mais ser alterada.
            </p>
          }
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ opcoes.length ? 'Cancelar' : 'Fechar' }}</button>
      @if (opcoes.length) {
        <button mat-flat-button (click)="confirmar()">Confirmar</button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .cabecalho { display: flex; justify-content: space-between; align-items: center;
                 gap: 8px; margin-bottom: 16px; }
    .form { display: flex; flex-direction: column; }
    .aviso { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; font-size: 14px;
             color: var(--mat-sys-on-surface-variant); }
  `,
})
export class PagamentoDialogComponent {
  private ref = inject(MatDialogRef<PagamentoDialogComponent, MudancaPagamento>);
  private fb = inject(FormBuilder);

  dados = inject<PagamentoDialogData>(MAT_DIALOG_DATA);
  acao = ACAO;
  opcoes = TRANSICOES[this.dados.inscricao.statusPagamento];

  form = this.fb.group({
    status: this.fb.control<StatusPagamento | null>(null, Validators.required),
    forma: this.fb.control<FormaPagamento | null>(null),
    valor: this.fb.control<number | null>(this.dados.valorCaravana),
  });

  status = toSignal(this.form.controls.status.valueChanges, { initialValue: null });

  constructor() {
    // Forma e valor só são obrigatórios quando o novo status é PAGO
    this.form.controls.status.valueChanges.subscribe(s => {
      const { forma, valor } = this.form.controls;
      if (s === 'PAGO') {
        forma.setValidators(Validators.required);
        valor.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        forma.clearValidators();
        valor.clearValidators();
      }
      forma.updateValueAndValidity();
      valor.updateValueAndValidity();
    });
  }

  confirmar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({
      status: v.status!,
      forma: v.status === 'PAGO' ? v.forma : null,
      valor: v.status === 'PAGO' ? v.valor : null,
    });
  }
}
