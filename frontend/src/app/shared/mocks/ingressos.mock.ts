import { Ingresso, StatusIngresso } from '../models/ingresso.model';
import { PASSAGEIROS_MOCK } from './passageiros.mock';

const SETORES = [
  { nome: 'Norte', sigla: 'NOR', valor: 80 },
  { nome: 'Sul', sigla: 'SUL', valor: 80 },
  { nome: 'Leste Inferior', sigla: 'LEI', valor: 150 },
  { nome: 'Camarote', sigla: 'CAM', valor: 400 },
];

const statusDe = (n: number): StatusIngresso =>
  n === 11 ? 'CANCELADO' : n % 4 === 0 ? 'VENDIDO' : n % 5 === 1 ? 'RESERVADO' : 'DISPONIVEL';

// 12 ingressos para cada um dos jogos agendados (ids 1, 2 e 3)
export const INGRESSOS_MOCK: Ingresso[] = [1, 2, 3].flatMap(jogoId =>
  Array.from({ length: 12 }, (_, n): Ingresso => {
    const setor = SETORES[Math.floor(n / 3)];
    const status = statusDe(n);
    const passageiro = status === 'VENDIDO' ? PASSAGEIROS_MOCK[n % PASSAGEIROS_MOCK.length] : null;
    return {
      id: jogoId * 100 + n,
      jogoId,
      setor: setor.nome,
      valor: setor.valor,
      codigo: `JG${jogoId}-${setor.sigla}-${String((n % 3) + 1).padStart(3, '0')}`,
      status,
      passageiroId: passageiro?.id ?? null,
      passageiroNome: passageiro?.nome ?? null,
    };
  }),
);
