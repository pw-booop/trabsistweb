import { CaravanaResumo } from '../models/caravana.model';
import { JOGOS_MOCK } from './jogos.mock';
import { emDias } from './datas';

const jogo = (id: number) => JOGOS_MOCK.find(j => j.id === id)!;

export const CARAVANAS_MOCK: CaravanaResumo[] = [
  {
    id: 1, nome: 'Caravana Fiel Torcida',
    jogo: jogo(1),
    localSaida: 'Lauro de Freitas', horarioSaida: emDias(1, 9, 0),
    valorPorPessoa: 80, status: 'ABERTA', capacidadeTotal: 46, inscricoesAtivas: 31,
  },
  {
    id: 2, nome: 'Excursão Tricolor',
    jogo: jogo(2),
    localSaida: 'Salvador - Rodoviária', horarioSaida: emDias(6, 20, 0),
    valorPorPessoa: 250, status: 'LOTADA', capacidadeTotal: 40, inscricoesAtivas: 40,
  },
  {
    id: 3, nome: 'Ônibus da Galera',
    jogo: jogo(3),
    localSaida: 'Feira de Santana', horarioSaida: emDias(14, 14, 0),
    valorPorPessoa: 320, status: 'ABERTA', capacidadeTotal: 92, inscricoesAtivas: 12,
  },
  {
    id: 4, nome: 'Caravana Cancelada',
    jogo: jogo(4),
    localSaida: 'Camaçari', horarioSaida: emDias(-8, 12, 0),
    valorPorPessoa: 60, status: 'CANCELADA', capacidadeTotal: 46, inscricoesAtivas: 5,
  },
];
