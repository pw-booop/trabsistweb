import { Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { ErroApi } from '../shared/models/usuario.model';

export interface InscricaoPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  onibusId: number | null;
}

// CPF que simula "já inscrito" (RN04) para você testar o erro 409
const CPF_JA_INSCRITO = '52998224725';

@Injectable({ providedIn: 'root' })
export class InscricaoService {
  // SIMULADO: trocar por POST /api/caravanas/:id/inscricoes
  inscrever(caravanaId: number, dados: InscricaoPayload): Observable<{ id: number }> {
    console.log(`POST /api/caravanas/${caravanaId}/inscricoes`, dados);
    return timer(800).pipe(
      switchMap(() => {
        if (dados.cpf.replace(/\D/g, '') === CPF_JA_INSCRITO) {
          const erro: ErroApi = {
            status: 409,
            mensagem: 'Este CPF já está inscrito nesta caravana',
            detalhes: [],
          };
          return throwError(() => erro);
        }
        return of({ id: Date.now() });
      }),
    );
  }
}
