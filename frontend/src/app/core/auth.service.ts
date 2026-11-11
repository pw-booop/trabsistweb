import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, switchMap, tap, throwError, timer } from 'rxjs';
import { ErroApi, Perfil, Usuario } from '../shared/models/usuario.model';

const SENHA_DEMO = '123456';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuario = signal<Usuario | null>(null);

  usuario = this._usuario.asReadonly();
  logado = computed(() => this._usuario() !== null);

  // SIMULADO: trocar por POST /api/auth/login quando o Back entregar
  login(email: string, senha: string): Observable<Usuario> {
    return timer(800).pipe(
      switchMap(() => {
        if (senha !== SENHA_DEMO) {
          const erro: ErroApi = { status: 401, mensagem: 'E-mail ou senha inválidos', detalhes: [] };
          return throwError(() => erro);
        }
        const perfil: Perfil = email.startsWith('admin')
          ? 'ADMIN'
          : email.startsWith('org')
            ? 'ORGANIZADOR'
            : 'TORCEDOR';
        return of<Usuario>({ id: 1, nome: email.split('@')[0], email, perfil });
      }),
      tap(u => this._usuario.set(u)),
    );
  }

  logout() {
    this._usuario.set(null);
  }
}
