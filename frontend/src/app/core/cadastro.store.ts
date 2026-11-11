import { Injectable, inject, signal } from '@angular/core';
import { CARAVANAS_MOCK } from '../shared/mocks/caravanas.mock';
import { emDias } from '../shared/mocks/datas';
import { ESTADIOS_MOCK } from '../shared/mocks/estadios.mock';
import { Estadio } from '../shared/models/estadio.model';
import { JogoCadastro, TimeCadastro } from '../shared/models/cadastro.model';
import { IngressoStore } from './ingresso.store';

const proximoId = (l: { id: number }[]) => Math.max(0, ...l.map(x => x.id)) + 1;

@Injectable({ providedIn: 'root' })
export class CadastroStore {
  private ingressos = inject(IngressoStore);

  readonly times = signal<TimeCadastro[]>([
    { id: 1, nome: 'Bahia', sigla: 'BAH', cidade: 'Salvador' },
    { id: 2, nome: 'Vitória', sigla: 'VIT', cidade: 'Salvador' },
    { id: 3, nome: 'Flamengo', sigla: 'FLA', cidade: 'Rio de Janeiro' },
    { id: 4, nome: 'Palmeiras', sigla: 'PAL', cidade: 'São Paulo' },
    { id: 5, nome: 'Sport', sigla: 'SPT', cidade: 'Recife' },
    { id: 6, nome: 'Fortaleza', sigla: 'FOR', cidade: 'Fortaleza' },
  ]);

  readonly estadios = signal<Estadio[]>(ESTADIOS_MOCK);

  // Mesmos jogos de jogos.mock.ts (ids 1 a 5), no formato do cadastro
  readonly jogos = signal<JogoCadastro[]>([
    { id: 1, mandanteId: 1, visitanteId: 2, estadioId: 1, dataHora: emDias(1, 16, 0), campeonato: 'Brasileirão Série A', status: 'AGENDADO' },
    { id: 2, mandanteId: 3, visitanteId: 1, estadioId: 2, dataHora: emDias(8, 18, 30), campeonato: 'Brasileirão Série A', status: 'AGENDADO' },
    { id: 3, mandanteId: 4, visitanteId: 1, estadioId: 3, dataHora: emDias(15, 20, 0), campeonato: 'Brasileirão Série A', status: 'AGENDADO' },
    { id: 4, mandanteId: 1, visitanteId: 5, estadioId: 1, dataHora: emDias(-8, 19, 0), campeonato: 'Brasileirão Série A', status: 'CANCELADO' },
    { id: 5, mandanteId: 1, visitanteId: 6, estadioId: 1, dataHora: emDias(-28, 16, 0), campeonato: 'Brasileirão Série A', status: 'REALIZADO' },
  ]);

  nomeTime(id: number) {
    return this.times().find(t => t.id === id)?.nome ?? '—';
  }
  nomeEstadio(id: number) {
    return this.estadios().find(e => e.id === id)?.nome ?? '—';
  }

  qtdJogosDoTime(id: number) {
    return this.jogos().filter(j => j.mandanteId === id || j.visitanteId === id).length;
  }
  qtdJogosDoEstadio(id: number) {
    return this.jogos().filter(j => j.estadioId === id).length;
  }

  // ---- RN12: devolve o motivo do bloqueio, ou null se pode excluir ----
  bloqueioTime(id: number): string | null {
    const n = this.qtdJogosDoTime(id);
    return n ? `possui ${n} jogo(s) cadastrado(s)` : null;
  }

  bloqueioEstadio(id: number): string | null {
    const n = this.qtdJogosDoEstadio(id);
    return n ? `sedia ${n} jogo(s) cadastrado(s)` : null;
  }

  bloqueioJogo(id: number): string | null {
    const caravanas = CARAVANAS_MOCK.filter(c => c.jogo.id === id).length;
    const ingressos = this.ingressos.ingressos().filter(i => i.jogoId === id).length;
    const partes = [
      caravanas ? `${caravanas} caravana(s)` : '',
      ingressos ? `${ingressos} ingresso(s)` : '',
    ].filter(Boolean);
    return partes.length ? `possui ${partes.join(' e ')}` : null;
  }

  // ---- SIMULADO: trocar por POST/PUT/DELETE em /api/times, /estadios e /jogos ----
  salvarTime(dados: Omit<TimeCadastro, 'id'>, id?: number) {
    this.times.update(l =>
      id === undefined ? [...l, { id: proximoId(l), ...dados }] : l.map(t => (t.id === id ? { id, ...dados } : t)),
    );
  }
  removerTime(id: number) {
    this.times.update(l => l.filter(t => t.id !== id));
  }

  salvarEstadio(dados: Omit<Estadio, 'id'>, id?: number) {
    this.estadios.update(l =>
      id === undefined ? [...l, { id: proximoId(l), ...dados }] : l.map(e => (e.id === id ? { id, ...dados } : e)),
    );
  }
  removerEstadio(id: number) {
    this.estadios.update(l => l.filter(e => e.id !== id));
  }

  salvarJogo(dados: Omit<JogoCadastro, 'id'>, id?: number) {
    this.jogos.update(l =>
      id === undefined ? [...l, { id: proximoId(l), ...dados }] : l.map(j => (j.id === id ? { id, ...dados } : j)),
    );
  }
  removerJogo(id: number) {
    this.jogos.update(l => l.filter(j => j.id !== id));
  }
}
