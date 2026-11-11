import { StatusPagamento } from './caravana.model';

export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO';

export interface InscricaoResumo {
  id: number;
  caravanaId: number;
  passageiroNome: string;
  cpf: string;
  onibusId: number | null;
  assento: string | null;
  statusPagamento: StatusPagamento;
  formaPagamento: FormaPagamento | null;
  valorPago: number | null;
}
