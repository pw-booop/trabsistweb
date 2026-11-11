import { Injectable, signal } from '@angular/core';
import { INSCRICOES_MOCK } from '../shared/mocks/inscricoes.mock';
import { FormaPagamento, InscricaoResumo } from '../shared/models/inscricao.model';
import { StatusPagamento } from '../shared/models/caravana.model';

export interface MudancaPagamento {
  status: StatusPagamento;
  forma: FormaPagamento | null;
  valor: number | null;
}

@Injectable({ providedIn: 'root' })
export class InscricaoStore {
  readonly inscricoes = signal<InscricaoResumo[]>(INSCRICOES_MOCK);

  // SIMULADO: trocar por PATCH /api/inscricoes/:id/pagamento
  atualizarPagamento(id: number, m: MudancaPagamento) {
    this.inscricoes.update(lista =>
      lista.map((i): InscricaoResumo => {
        if (i.id !== id) return i;
        switch (m.status) {
          case 'PAGO':
            return { ...i, statusPagamento: 'PAGO', formaPagamento: m.forma, valorPago: m.valor };
          case 'REEMBOLSADO':
            return { ...i, statusPagamento: 'REEMBOLSADO' };
          case 'CANCELADO': // libera o assento e o lugar no ônibus, e zera o pagamento
            return {
              ...i, statusPagamento: 'CANCELADO', assento: null, onibusId: null,
              formaPagamento: null, valorPago: null,
            };
          default:
            return { ...i, statusPagamento: 'PENDENTE', formaPagamento: null, valorPago: null };
        }
      }),
    );
  }
}
