import { StatusPagamento } from '../models/caravana.model';

// De qual status se pode ir para quais
export const TRANSICOES: Record<StatusPagamento, StatusPagamento[]> = {
  PENDENTE: ['PAGO', 'CANCELADO'],
  PAGO: ['REEMBOLSADO'],
  CANCELADO: ['PENDENTE'], // reativar (exige vaga, RN03)
  REEMBOLSADO: [],         // status final
};

export const ACAO: Record<StatusPagamento, string> = {
  PAGO: 'Confirmar pagamento',
  REEMBOLSADO: 'Reembolsar',
  CANCELADO: 'Cancelar inscrição',
  PENDENTE: 'Reativar inscrição',
};
