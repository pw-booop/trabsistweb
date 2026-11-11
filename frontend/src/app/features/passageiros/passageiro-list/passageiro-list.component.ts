import { Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PassageiroStore } from '../../../core/passageiro.store';
import { soDigitos } from '../../../shared/utils/formatar';

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

@Component({
  selector: 'app-passageiro-list',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './passageiro-list.component.html',
  styleUrl: './passageiro-list.component.scss',
})
export class PassageiroListComponent {
  private store = inject(PassageiroStore);

  colunas = ['nome', 'cpf', 'telefone', 'email', 'acoes'];

  busca = new FormControl('', { nonNullable: true });
  private termo = toSignal(this.busca.valueChanges, { initialValue: '' });

  linhas = computed(() => {
    const texto = normalizar(this.termo());
    const digitos = soDigitos(this.termo());
    if (!texto) return this.store.passageiros();

    return this.store.passageiros().filter(
      p =>
        normalizar(p.nome).includes(texto) ||
        (digitos.length > 0 && soDigitos(p.cpf).includes(digitos)),
    );
  });
}
