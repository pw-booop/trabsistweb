// Gera datas relativas a "hoje", para o mock nunca ficar velho.
// Ex.: emDias(1, 16, 0) = amanhã às 16:00 (formato local, sem fuso)
export function emDias(dias: number, hora = 0, minuto = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}
