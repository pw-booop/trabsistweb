import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { CARAVANAS_MOCK } from '../../../shared/mocks/caravanas.mock';
import { ONIBUS_MOCK } from '../../../shared/mocks/onibus.mock';
import { cpfValido } from '../../../shared/validators/cpf.validator';
import { formatarCpf } from '../../../shared/utils/formatar';
import { InscricaoService } from '../../../core/inscricao.service';
import { ErroApi } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-caravana-inscricao',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    StatusBadgeComponent,
  ],
  templateUrl: './caravana-inscricao.component.html',
  styleUrl: './caravana-inscricao.component.scss',
})
export class CaravanaInscricaoComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private service = inject(InscricaoService);

  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  caravana = CARAVANAS_MOCK.find(c => c.id === this.id);

  onibus = ONIBUS_MOCK
    .filter(o => o.caravanaId === this.id)
    .map(o => ({ ...o, vagas: o.capacidade - o.ocupadas }));

  vagas = this.onibus.reduce((soma, o) => soma + o.vagas, 0);

  // RN03: só inscreve em caravana ABERTA e com vagas
  bloqueio =
    this.caravana?.status !== 'ABERTA'
      ? 'Esta caravana não está aberta para inscrições.'
      : this.vagas === 0
        ? 'Esta caravana não tem mais vagas.'
        : null;

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, cpfValido]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/)]],
    email: ['', Validators.email],
    onibusId: [null as number | null],
  });

  enviando = signal(false);
  erro = signal<string | null>(null);

  mascaraCpf(e: Event) {
    this.form.controls.cpf.setValue(
      formatarCpf((e.target as HTMLInputElement).value),
      { emitEvent: false },
    );
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro.set(null);
    this.enviando.set(true);

    this.service
      .inscrever(this.id, this.form.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.snack.open('Inscrição realizada! Pagamento pendente.', 'OK', { duration: 4000 });
          this.router.navigateByUrl('/caravanas');
        },
        error: (e: ErroApi) => this.erro.set(e.mensagem ?? 'Não foi possível inscrever'),
      });
  }
}
