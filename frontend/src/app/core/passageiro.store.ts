import { Injectable, signal } from '@angular/core';
import { PASSAGEIROS_MOCK } from '../shared/mocks/passageiros.mock';
import { Passageiro } from '../shared/models/passageiro.model';
import { soDigitos } from '../shared/utils/formatar';

@Injectable({ providedIn: 'root' })
export class PassageiroStore {
  readonly passageiros = signal<Passageiro[]>(
    PASSAGEIROS_MOCK.map((p, i) => ({
      ...p,
      telefone: `(71) 9800${i}-100${i}`,
      email: `${p.nome.split(' ')[0].toLowerCase()}@email.com`,
    })),
  );

  obter(id: number) {
    return this.passageiros().find(p => p.id === id);
  }

  // RN07: CPF único (compara só os dígitos)
  cpfExiste(cpf: string, ignorarId?: number): boolean {
    const alvo = soDigitos(cpf);
    return this.passageiros().some(p => p.id !== ignorarId && soDigitos(p.cpf) === alvo);
  }

  // SIMULADO: trocar por POST /api/passageiros
  criar(dados: Omit<Passageiro, 'id'>) {
    const id = Math.max(0, ...this.passageiros().map(p => p.id)) + 1;
    this.passageiros.update(l => [...l, { id, ...dados }]);
  }

  // SIMULADO: trocar por PUT /api/passageiros/:id
  atualizar(id: number, dados: Omit<Passageiro, 'id'>) {
    this.passageiros.update(l => l.map(p => (p.id === id ? { id, ...dados } : p)));
  }
}
