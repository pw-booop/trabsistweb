import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmData {
  titulo: string;
  mensagem: string;
  confirmar?: string;
  perigo?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>{{ data.mensagem }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [mat-dialog-close]="true" [class.perigo]="data.perigo">
        {{ data.confirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `.perigo { --mat-button-filled-container-color: var(--status-cancelada); }`,
})
export class ConfirmDialogComponent {
  data = inject<ConfirmData>(MAT_DIALOG_DATA);
}

// Atalho: emite true se o usuário confirmou
export const abrirConfirmacao = (dialog: MatDialog, data: ConfirmData) =>
  dialog
    .open<ConfirmDialogComponent, ConfirmData, boolean>(ConfirmDialogComponent, {
      data,
      maxWidth: '92vw',
    })
    .afterClosed();
