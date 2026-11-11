import { StatusCaravana } from '../models/caravana.model';

// RN05: sem vagas -> LOTADA; com vagas -> ABERTA. ENCERRADA e CANCELADA não mudam sozinhas.
export function statusDerivado(base: StatusCaravana, vagas: number): StatusCaravana {
  if (base === 'ABERTA' || base === 'LOTADA') return vagas === 0 ? 'LOTADA' : 'ABERTA';
  return base;
}
