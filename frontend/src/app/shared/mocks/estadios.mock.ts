import { Estadio } from '../models/estadio.model';

// Capacidades REDUZIDAS de propósito, só para você conseguir testar a RN09 na tela
export const ESTADIOS_MOCK: Estadio[] = [
  { id: 1, nome: 'Arena Fonte Nova', cidade: 'Salvador', uf: 'BA', capacidade: 100 },
  { id: 2, nome: 'Maracanã', cidade: 'Rio de Janeiro', uf: 'RJ', capacidade: 120 },
  { id: 3, nome: 'Allianz Parque', cidade: 'São Paulo', uf: 'SP', capacidade: 80 },
];

// jogoId -> estadioId
export const ESTADIO_DO_JOGO: Record<number, number> = { 1: 1, 2: 2, 3: 3 };
