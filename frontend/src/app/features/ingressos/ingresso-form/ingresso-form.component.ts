import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IngressoStore } from '../../../core/ingresso.store';
import { JOGOS_MOCK } from '../../../shared/mocks/jogos.mock';
import { ESTADIOS_MOCK, ESTADIO_DO_JOGO } from '../../../shared/mocks/estadios.mock';

@Component({
  selector: 'app-ingresso-form',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule,
  ],
  templateUrl: './ingresso-form.component.html',
  styleUrl: './ingresso-form.component.scss',
})
export class IngressoFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private store = inject(IngressoStore);

  private idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  editando = this.idParam !== null;
  ingressoEdicao = this.idParam ? this.store.obter(Number(this.idParam)) : undefined;
  naoEncontrado = this.editando && !this.ingressoEdicao;
  editavel = this.ingressoEdicao
    ? ['DISPONIVEL', 'RESERVADO'].includes(this.ingressoEdicao.status)
    : true;
  jogoEdicao = JOGOS_MOCK.find(j => j.id === this.ingressoEdicao?.jogoId);

  jogos = JOGOS_MOCK.filter(j => j.status === 'AGENDADO');
  setores = ['Norte', 'Sul', 'Leste Inferior', 'Leste Superior', 'Oeste', 'Camarote'];

  private estadioDoJogo(jogoId: number | null) {
    const id = jogoId === null ? undefined : ESTADIO_DO_JOGO[jogoId];
    return ESTADIOS_MOCK.find(e => e.id === id);
  }

  // RN09: ingressos ativos (não cancelados) contam contra a capacidade
  private restanteDoJogo(jogoId: number | null): number | null {
    const estadio = this.estadioDoJogo(jogoId);
    if (!estadio) return null;
    const existentes = this.store
      .ingressos()
      .filter(i => i.jogoId === jogoId && i.status !== 'CANCELADO').length;
    return estadio.capacidade - existentes;
  }

  private excedeCapacidade: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
    if (this.editando) return null;
    const qtd = Number(g.get('quantidade')?.value) || 0;
    const restante = this.restanteDoJogo(g.get('jogoId')?.value ?? null);
    return restante !== null && qtd > restante ? { capacidade: { restante } } : null;
  };

  form = this.fb.group(
    {
      jogoId: this.fb.control<number | null>(null, Validators.required),
      setor: this.fb.nonNullable.control('', Validators.required),
      valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
      quantidade: this.fb.control<number | null>(1, [
        Validators.required, Validators.min(1), Validators.pattern(/^\d+$/),
      ]),
    },
    { validators: [this.excedeCapacidade] },
  );

  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  info = computed(() => {
    const jogoId = this.valores().jogoId ?? null;
    const estadio = this.estadioDoJogo(jogoId);
    const restante = this.restanteDoJogo(jogoId);
    if (!estadio || restante === null) return null;
    const ocupados = estadio.capacidade - restante;
    const qtd = Number(this.valores().quantidade) || 0;
    return {
      estadio,
      ocupados,
      restante,
      previsao: Math.min(100, ((ocupados + qtd) / estadio.capacidade) * 100),
    };
  });

  total = computed(
    () => (Number(this.valores().quantidade) || 0) * (Number(this.valores().valor) || 0),
  );

  constructor() {
    const i = this.ingressoEdicao;
    if (i) {
      this.form.patchValue({ jogoId: i.jogoId, setor: i.setor, valor: i.valor });
      this.form.controls.jogoId.disable();
      this.form.controls.quantidade.disable();
    }
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    if (this.ingressoEdicao) {
      this.store.atualizar(this.ingressoEdicao.id, { setor: v.setor, valor: v.valor! });
      this.snack.open(`${this.ingressoEdicao.codigo} atualizado`, 'OK', { duration: 3000 });
    } else {
      const n = this.store.criarLote(v.jogoId!, v.setor, v.valor!, v.quantidade!);
      this.snack.open(`${n} ingresso(s) criado(s)`, 'OK', { duration: 3000 });
    }
    this.router.navigateByUrl('/ingressos');
  }
}
