import { Injectable, signal } from '@angular/core';
import { INGRESSOS_MOCK } from '../shared/mocks/ingressos.mock';
import { Ingresso } from '../shared/models/ingresso.model';

// "Leste Inferior" -> LEI, "Norte" -> NOR
const sigla = (setor: string) => {
  const [a, b] = setor
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().split(' ');
  return b ? a.slice(0, 2) + b[0] : a.slice(0, 3);
};

@Injectable({ providedIn: 'root' })
export class IngressoStore {
  readonly ingressos = signal<Ingresso[]>(INGRESSOS_MOCK);

  obter(id: number) {
    return this.ingressos().find(i => i.id === id);
  }

  // SIMULADO: trocar por POST /api/ingressos (o código real é gerado no back)
  criarLote(jogoId: number, setor: string, valor: number, quantidade: number): number {
    const lista = this.ingressos();
    const prefixo = `JG${jogoId}-${sigla(setor)}-`;
    const ultimo = Math.max(
      0,
      ...lista.filter(i => i.codigo.startsWith(prefixo)).map(i => Number(i.codigo.slice(prefixo.length))),
    );
    const proximoId = Math.max(0, ...lista.map(i => i.id)) + 1;

    const novos = Array.from({ length: quantidade }, (_, n): Ingresso => ({
      id: proximoId + n,
      jogoId, setor, valor,
      codigo: `${prefixo}${String(ultimo + n + 1).padStart(3, '0')}`,
      status: 'DISPONIVEL',
      passageiroId: null,
      passageiroNome: null,
    }));

    this.ingressos.set([...lista, ...novos]);
    return novos.length;
  }

  // SIMULADO: trocar por PUT /api/ingressos/:id e PATCH .../vincular
  atualizar(id: number, dados: Partial<Ingresso>) {
    this.ingressos.update(l => l.map(i => (i.id === id ? { ...i, ...dados } : i)));
  }
}
