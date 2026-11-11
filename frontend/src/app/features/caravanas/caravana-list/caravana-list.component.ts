import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CaravanaCardComponent } from '../../../shared/caravana-card/caravana-card.component';
import { CARAVANAS_MOCK } from '../../../shared/mocks/caravanas.mock';
import { CaravanaResumo } from '../../../shared/models/caravana.model';
import { InscricaoStore } from '../../../core/inscricao.store';
import { statusDerivado } from '../../../shared/utils/caravana';

// "Bahía" e "bahia" passam a ser iguais na busca
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

@Component({
  selector: 'app-caravana-list',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatSlideToggleModule, MatButtonModule, MatIconModule,
    CaravanaCardComponent,
  ],
  templateUrl: './caravana-list.component.html',
  styleUrl: './caravana-list.component.scss',
})
export class CaravanaListComponent {
  private inscricoes = inject(InscricaoStore);

  // Vagas e status acompanham as inscrições (cancelar no painel reabre a caravana, RN05)
  private todas = computed<CaravanaResumo[]>(() =>
    CARAVANAS_MOCK.map(c => {
      const ativas = this.inscricoes
        .inscricoes()
        .filter(i => i.caravanaId === c.id && i.statusPagamento !== 'CANCELADO').length;
      return {
        ...c,
        inscricoesAtivas: ativas,
        status: statusDerivado(c.status, c.capacidadeTotal - ativas),
      };
    }),
  );

  cidades = [...new Set(CARAVANAS_MOCK.map(c => c.localSaida))].sort();

  form = new FormGroup({
    jogo: new FormControl('', { nonNullable: true }),
    data: new FormControl<Date | null>(null),
    cidade: new FormControl('', { nonNullable: true }),
    comVagas: new FormControl(false, { nonNullable: true }),
  });

  private filtros = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  filtradas = computed(() => {
    const { jogo, data, cidade, comVagas } = this.filtros();
    const termo = normalizar(jogo ?? '');

    return this.todas().filter(c => {
      const j = c.jogo;
      const times = normalizar(`${j.mandante.nome} ${j.visitante.nome}`);
      const vagas = c.capacidadeTotal - c.inscricoesAtivas;

      if (termo && !times.includes(termo)) return false;
      if (data && !mesmoDia(new Date(j.dataHora), data)) return false;
      if (cidade && c.localSaida !== cidade) return false;
      if (comVagas && !(c.status === 'ABERTA' && vagas > 0)) return false;
      return true;
    });
  });

  limpar() {
    this.form.reset({ jogo: '', data: null, cidade: '', comVagas: false });
  }
}
