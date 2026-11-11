import { StatusJogo, Time } from './caravana.model';

export interface TimeCadastro extends Time {
  cidade: string;
}

export interface JogoCadastro {
  id: number;
  mandanteId: number;
  visitanteId: number;
  estadioId: number;
  dataHora: string; // 'YYYY-MM-DDTHH:mm'
  campeonato: string;
  status: StatusJogo;
}
