import { PassageiroResumo } from './ingresso.model';

export interface Passageiro extends PassageiroResumo {
  telefone: string;
  email: string | null;
}
