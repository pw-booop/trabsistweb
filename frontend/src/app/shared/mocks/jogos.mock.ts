import { JogoComStatus } from '../models/caravana.model';
import { emDias } from './datas';

const jogo = (
  id: number, m: string, v: string, data: string,
  status: JogoComStatus['status'] = 'AGENDADO',
): JogoComStatus => ({
  id,
  mandante: { id: id * 10, nome: m, sigla: m.slice(0, 3).toUpperCase() },
  visitante: { id: id * 10 + 1, nome: v, sigla: v.slice(0, 3).toUpperCase() },
  dataHora: data,
  campeonato: 'Brasileirão Série A',
  status,
});

export const JOGOS_MOCK: JogoComStatus[] = [
  jogo(1, 'Bahia', 'Vitória', emDias(1, 16, 0)),
  jogo(2, 'Flamengo', 'Bahia', emDias(8, 18, 30)),
  jogo(3, 'Palmeiras', 'Bahia', emDias(15, 20, 0)),
  jogo(4, 'Bahia', 'Sport', emDias(-8, 19, 0), 'CANCELADO'),
  jogo(5, 'Bahia', 'Fortaleza', emDias(-28, 16, 0), 'REALIZADO'),
];
