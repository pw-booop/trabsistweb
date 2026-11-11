import { StatusIngresso } from './ingresso.model';

export type StatusCaravana = 'ABERTA' | 'LOTADA' | 'ENCERRADA' | 'CANCELADA';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'REEMBOLSADO';
export type StatusJogo = 'AGENDADO' | 'REALIZADO' | 'CANCELADO';

// Todos os status que o StatusBadgeComponent sabe desenhar
export type Status = StatusCaravana | StatusPagamento | StatusIngresso | StatusJogo;

export interface Time {
  id: number;
  nome: string;
  sigla: string;
}

export interface Jogo {
  id: number;
  mandante: Time;
  visitante: Time;
  dataHora: string; // ISO 8601, como vem no JSON
  campeonato: string;
}

export interface JogoComStatus extends Jogo {
  status: StatusJogo;
}

export interface CaravanaResumo {
  id: number;
  nome: string;
  jogo: Jogo;
  localSaida: string;
  horarioSaida: string;
  valorPorPessoa: number;
  status: StatusCaravana;
  capacidadeTotal: number;   // soma dos ônibus (RN02)
  inscricoesAtivas: number;  // inscrições não canceladas (RN02)
}
