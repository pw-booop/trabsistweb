import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Ingresso, PassageiroResumo } from '../../../shared/models/ingresso.model';
import { PassageiroStore } from '../../../core/passageiro.store';

@Component({
  selector: 'app-vincular-dialog',
  imports: [
    CurrencyPipe, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Vincular ingresso</h2>
    <mat-dialog-content>
      <p class="resumo">
        <strong>{{ ingresso.codigo }}</strong> · {{ ingresso.setor }} ·
        {{ ingresso.valor | currency: 'BRL' }}
      </p>
      <mat-form-field appearance="outline" class="campo">
        <mat-label>Passageiro</mat-label>
        <mat-select [formControl]="passageiro">
          @for (p of passageiros; track p.id) {
            <mat-option [value]="p">{{ p.nome }} · {{ p.cpf }}</mat-option>
          }
        </mat-select>
        <mat-error>Selecione um passageiro</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button (click)="confirmar()">Vincular</button>
    </mat-dialog-actions>
  `,
  styles: `
    .resumo { margin: 0 0 16px; color: var(--mat-sys-on-surface-variant); }
    .campo { width: 100%; }
  `,
})
export class VincularDialogComponent {
  private ref = inject(MatDialogRef<VincularDialogComponent, PassageiroResumo>);
  ingresso = inject<Ingresso>(MAT_DIALOG_DATA);
  passageiros = inject(PassageiroStore).passageiros();
  passageiro = new FormControl<PassageiroResumo | null>(null, Validators.required);

  confirmar() {
    if (this.passageiro.invalid) {
      this.passageiro.markAsTouched();
      return;
    }
    this.ref.close(this.passageiro.value);
  }
}
