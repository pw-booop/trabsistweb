import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule,
  ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JOGOS_MOCK } from '../../../shared/mocks/jogos.mock';
import { JogoComStatus } from '../../../shared/models/caravana.model';

// A saída precisa ser antes do jogo
const saidaAntesDoJogo = (jogos: JogoComStatus[]): ValidatorFn =>
  (g: AbstractControl): ValidationErrors | null => {
    const jogo = jogos.find(j => j.id === g.get('jogoId')?.value);
    const saida = g.get('horarioSaida')?.value;
    if (!jogo || !saida) return null;
    return new Date(saida) < new Date(jogo.dataHora) ? null : { saidaDepoisDoJogo: true };
  };

@Component({
  selector: 'app-caravana-form',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
  templateUrl: './caravana-form.component.html',
  styleUrl: './caravana-form.component.scss',
})
export class CaravanaFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  // RN01: só jogos AGENDADOS e com data futura
  jogos = JOGOS_MOCK.filter(
    j => j.status === 'AGENDADO' && new Date(j.dataHora) > new Date(),
  );

  form = this.fb.nonNullable.group(
    {
      jogoId: [null as number | null, Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      localSaida: ['', Validators.required],
      horarioSaida: ['', Validators.required],
      valorPorPessoa: [null as number | null, [Validators.required, Validators.min(0.01)]],
      descricao: [''],
      onibus: this.fb.array([this.novoOnibus()], Validators.minLength(1)),
    },
    { validators: [saidaAntesDoJogo(this.jogos)] },
  );

  get onibus() {
    return this.form.controls.onibus;
  }

  private valores = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  jogoSelecionado = computed(() =>
    this.jogos.find(j => j.id === this.valores().jogoId),
  );

  // RN02: capacidade = soma da capacidade dos ônibus
  capacidadeTotal = computed(() =>
    (this.valores().onibus ?? []).reduce((s, o) => s + (Number(o.capacidade) || 0), 0),
  );

  previsto = computed(
    () => this.capacidadeTotal() * (Number(this.valores().valorPorPessoa) || 0),
  );

  private novoOnibus() {
    return this.fb.nonNullable.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/)]],
      empresa: ['', Validators.required],
      capacidade: [46, [Validators.required, Validators.min(1), Validators.max(80)]],
    });
  }

  adicionarOnibus() {
    this.onibus.push(this.novoOnibus());
  }

  removerOnibus(i: number) {
    if (this.onibus.length > 1) this.onibus.removeAt(i);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // SIMULADO: trocar por POST /api/caravanas
    console.log('POST /api/caravanas', this.form.getRawValue());
    this.snack.open('Caravana criada (simulado)', 'OK', { duration: 3000 });
    this.router.navigateByUrl('/caravanas');
  }
}
