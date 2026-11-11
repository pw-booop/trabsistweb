export type Perfil = 'ADMIN' | 'ORGANIZADOR' | 'TORCEDOR';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

// Padrão de erro da API (RNF06, seção 8 da doc)
export interface ErroApi {
  status: number;
  mensagem: string;
  detalhes: string[];
}
