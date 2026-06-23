import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { registrarPonto, buscarPontosDoMes, buscarUltimoPonto } from "@/services/ponto";
import { obterLocalizacao, enderecoAproximado } from "@/utils/location";
import { formatarData, formatarHora, labelTipoPonto } from "@/utils/format";
import { RegistroPonto } from "@/types";

function calcularHorasHoje(historico: RegistroPonto[]): string | null {
  const hoje = new Date().toDateString();
  const registrosHoje = historico
    .filter((r) => new Date(r.dataHora).toDateString() === hoje)
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));

  if (registrosHoje.length === 0) return null;

  let totalMs = 0;
  let entradaTime: Date | null = null;

  for (const r of registrosHoje) {
    if (r.tipo === "entrada") {
      entradaTime = new Date(r.dataHora);
    } else if ((r.tipo === "saida" || r.tipo === "pausa") && entradaTime) {
      totalMs += new Date(r.dataHora).getTime() - entradaTime.getTime();
      entradaTime = null;
    }
  }

  if (entradaTime) {
    totalMs += Date.now() - entradaTime.getTime();
  }

  if (totalMs === 0) return null;

  const totalMin = Math.floor(totalMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

export default function PontoScreen() {
  const { user, perfil } = useAuth();
  const [hora, setHora] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  const [historico, setHistorico] = useState<RegistroPonto[]>([]);
  const [ultimoPonto, setUltimoPonto] = useState<RegistroPonto | null>(null);
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (user) carregarDados();
  }, [user]);

  async function carregarDados() {
    if (!user) return;
    const [hist, ultimo] = await Promise.all([
      buscarPontosDoMes(user.uid),
      buscarUltimoPonto(user.uid)
    ]);
    setHistorico(hist);
    setUltimoPonto(ultimo);
  }

  const isSameDay = ultimoPonto
    ? new Date(ultimoPonto.dataHora).toDateString() === new Date().toDateString()
    : false;
  const lastType = isSameDay ? ultimoPonto?.tipo : null;

  const disableEntrada = carregando || lastType === "entrada";
  const disablePausa = carregando || lastType !== "entrada";
  const disableSaida = carregando || !lastType || lastType === "saida";

  const horasHoje = calcularHorasHoje(historico);

  async function handleRegistro(tipo: "entrada" | "saida" | "pausa") {
    if (!user || !perfil) return;
    const labels: Record<string, string> = { entrada: "entrada", pausa: "pausa", saida: "saida" };
    if (!window.confirm(`Confirmar registro de ${labels[tipo]}?`)) return;

    setCarregando(true);
    setStatus("Obtendo localizacao...");
    setStatusTipo("");
    try {
      let lat: number | undefined;
      let lon: number | undefined;
      let endereco: string | undefined;
      try {
        const coords = await obterLocalizacao();
        lat = coords.latitude;
        lon = coords.longitude;
        endereco = await enderecoAproximado(lat, lon);
      } catch {
        // localizacao opcional
      }
      setStatus("Registrando...");
      await registrarPonto(user.uid, tipo, lat, lon, endereco);
      setStatusTipo("success");
      setStatus(`${labelTipoPonto(tipo)} registrada com sucesso!`);
      await carregarDados();
    } catch {
      setStatusTipo("error");
      setStatus("Erro ao registrar ponto. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="screen">
      <p className="eyebrow">Ponto Eletronico</p>
      <h1 className="screen-title">Registro de Ponto</h1>

      <div className="ponto-hero">
        <div className="ponto-clock">{hora}</div>
        <div className="ponto-date">{formatarData(new Date().toISOString())}</div>
        {ultimoPonto && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 8 }}>
            Ultimo registro: <strong>{labelTipoPonto(ultimoPonto.tipo)}</strong> as {formatarHora(ultimoPonto.dataHora)}
          </p>
        )}
        {horasHoje && (
          <p style={{ fontSize: "0.85rem", color: "var(--gold-soft)", marginBottom: 16, fontWeight: 600 }}>
            Horas hoje: {horasHoje}
          </p>
        )}
        <div className="ponto-btns">
          <button className="btn btn-primary" onClick={() => handleRegistro("entrada")} disabled={disableEntrada}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1={15} y1={12} x2={3} y2={12} />
            </svg>
            Registrar Entrada
          </button>
          <button className="btn btn-secondary" onClick={() => handleRegistro("pausa")} disabled={disablePausa}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <rect x={6} y={4} width={4} height={16} />
              <rect x={14} y={4} width={4} height={16} />
            </svg>
            Registrar Pausa
          </button>
          <button className="btn btn-danger" onClick={() => handleRegistro("saida")} disabled={disableSaida}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1={21} y1={12} x2={9} y2={12} />
            </svg>
            Registrar Saida
          </button>
        </div>
        <p className={`status-msg ${statusTipo}`}>{status}</p>
      </div>

      <div className="card">
        <p className="card-title">Historico do Mes</p>
        {historico.length === 0 ? (
          <p className="empty">Nenhum registro este mes.</p>
        ) : (
          historico.map((r) => (
            <div key={r.id} className="history-item">
              <div className="history-item-left">
                <strong>{labelTipoPonto(r.tipo)}</strong>
                <span>{r.enderecoAproximado ?? "Localizacao nao disponivel"}</span>
              </div>
              <span className={`badge badge-${r.tipo}`}>
                {formatarHora(r.dataHora)}
                <br />
                <small style={{ fontWeight: 400 }}>{formatarData(r.dataHora)}</small>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
