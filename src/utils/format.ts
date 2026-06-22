export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function diasEntre(inicio: string, fim: string): number {
  const a = new Date(inicio);
  const b = new Date(fim);
  return Math.ceil((b.getTime() - a.getTime()) / 86400000) + 1;
}

export function labelTipoPonto(tipo: string): string {
  const map: Record<string, string> = { entrada: "Entrada", saida: "Saída", pausa: "Pausa" };
  return map[tipo] ?? tipo;
}

export function labelStatus(status: string): string {
  const map: Record<string, string> = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado"
  };
  return map[status] ?? status;
}

export function labelTipoAtestado(tipo: string): string {
  const map: Record<string, string> = {
    medico: "Médico",
    odontologico: "Odontológico",
    psicologico: "Psicológico",
    outro: "Outro"
  };
  return map[tipo] ?? tipo;
}

export function labelTipoAviso(tipo: string): string {
  const map: Record<string, string> = {
    geral: "Geral",
    urgente: "Urgente",
    rh: "RH",
    escala: "Escala",
    treinamento: "Treinamento"
  };
  return map[tipo] ?? tipo;
}
