import { CARAVANAS_MOCK } from './caravanas.mock';
import { OnibusResumo } from '../models/onibus.model';

// Capacidades por caravana (a soma bate com capacidadeTotal do mock)
const CAPACIDADES: Record<number, number[]> = {
  1: [46], 2: [40], 3: [46, 46], 4: [46],
};

export const ONIBUS_MOCK: OnibusResumo[] = CARAVANAS_MOCK.flatMap(c => {
  let restante = c.inscricoesAtivas;
  return CAPACIDADES[c.id].map((capacidade, i) => {
    const ocupadas = Math.min(capacidade, restante);
    restante -= ocupadas;
    return {
      id: c.id * 10 + i,
      caravanaId: c.id,
      placa: `PLC${c.id}A0${i + 1}`,
      empresa: i === 0 ? 'Viação Tricolor' : 'Expresso Azul',
      capacidade,
      ocupadas,
    };
  });
});
