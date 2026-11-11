import { CARAVANAS_MOCK } from './caravanas.mock';
import { ONIBUS_MOCK } from './onibus.mock';
import { FormaPagamento, InscricaoResumo } from '../models/inscricao.model';

const NOMES = [
  'Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Barros',
  'Felipe Costa', 'Gabriela Dias', 'Henrique Alves', 'Isabela Nunes',
  'João Pedro', 'Karina Reis', 'Lucas Freitas',
];
const FORMAS: FormaPagamento[] = ['PIX', 'DINHEIRO', 'CARTAO'];

const nome = (i: number) =>
  NOMES[i % NOMES.length] + (i >= NOMES.length ? ` ${Math.floor(i / NOMES.length) + 1}` : '');

// Preenche os ônibus da caravana em ordem, igual ao onibus.mock
const onibusDe = (caravanaId: number, i: number): number | null => {
  let acumulado = 0;
  for (const o of ONIBUS_MOCK.filter(o => o.caravanaId === caravanaId)) {
    acumulado += o.capacidade;
    if (i < acumulado) return o.id;
  }
  return null;
};

export const INSCRICOES_MOCK: InscricaoResumo[] = CARAVANAS_MOCK.flatMap(c => {
  const ativas = Array.from({ length: c.inscricoesAtivas }, (_, i): InscricaoResumo => {
    const pago = i % 3 !== 0; // 1 pendente a cada 3
    return {
      id: c.id * 1000 + i,
      caravanaId: c.id,
      passageiroNome: nome(i),
      cpf: `000.000.${String(i).padStart(3, '0')}-00`,
      onibusId: onibusDe(c.id, i),
      assento: String(i + 1).padStart(2, '0'),
      statusPagamento: pago ? 'PAGO' : 'PENDENTE',
      formaPagamento: pago ? FORMAS[i % 3] : null,
      valorPago: pago ? c.valorPorPessoa : null,
    };
  });

  // Uma inscrição cancelada, que não conta nas vagas (RN02)
  const cancelada: InscricaoResumo = {
    id: c.id * 1000 + 999,
    caravanaId: c.id,
    passageiroNome: 'Marcos Teixeira',
    cpf: '000.000.999-00',
    onibusId: null,
    assento: null,
    statusPagamento: 'CANCELADO',
    formaPagamento: null,
    valorPago: null,
  };

  return [...ativas, cancelada];
});
