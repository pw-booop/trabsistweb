import { Component, computed, input } from '@angular/core';
import { Status } from '../models/caravana.model';

const CONFIG: Record<Status, { label: string; cor: string }> = {
  // Caravana
  ABERTA: { label: 'Aberta', cor: 'var(--status-aberta)' },
  LOTADA: { label: 'Lotada', cor: 'var(--status-lotada)' },
  ENCERRADA: { label: 'Encerrada', cor: 'var(--status-encerrada)' },
  CANCELADA: { label: 'Cancelada', cor: 'var(--status-cancelada)' },
  // Pagamento
  PENDENTE: { label: 'Pendente', cor: 'var(--pagamento-pendente)' },
  PAGO: { label: 'Pago', cor: 'var(--pagamento-pago)' },
  CANCELADO: { label: 'Cancelado', cor: 'var(--pagamento-cancelado)' },
  REEMBOLSADO: { label: 'Reembolsado', cor: 'var(--pagamento-reembolsado)' },
  // Ingresso
  DISPONIVEL: { label: 'Disponível', cor: 'var(--ingresso-disponivel)' },
  RESERVADO: { label: 'Reservado', cor: 'var(--ingresso-reservado)' },
  VENDIDO: { label: 'Vendido', cor: 'var(--ingresso-vendido)' },
  // Jogo
  AGENDADO: { label: 'Agendado', cor: 'var(--ingresso-disponivel)' },
  REALIZADO: { label: 'Realizado', cor: 'var(--status-encerrada)' },
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  status = input.required<Status>();
  config = computed(() => CONFIG[this.status()]);
}
