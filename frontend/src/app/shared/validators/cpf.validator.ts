import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValido(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value ?? '').replace(/\D/g, '');
  if (!v) return null; // o "required" cuida do vazio
  if (v.length !== 11 || /^(\d)\1{10}$/.test(v)) return { cpf: true };

  const digito = (base: string, pesoInicial: number) => {
    const soma = [...base].reduce((s, n, i) => s + Number(n) * (pesoInicial - i), 0);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };

  return digito(v.slice(0, 9), 10) === Number(v[9]) &&
    digito(v.slice(0, 10), 11) === Number(v[10])
    ? null
    : { cpf: true };
}
