export type StatusIngresso = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'CANCELADO';

export interface Ingresso {
  id: number;
  jogoId: number;
  setor: string;
  valor: number;
  codigo: string;
  status: StatusIngresso;
  passageiroId: number | null;
  passageiroNome: string | null;
}

export interface PassageiroResumo {
  id: number;
  nome: string;
  cpf: string;
}
