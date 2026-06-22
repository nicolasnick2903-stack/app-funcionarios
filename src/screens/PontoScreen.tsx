import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { registrarPonto, buscarPontosDoMes, buscarUltimoPonto } from "@/services/ponto";
import { obterLocalizacao, enderecoAproximado } from "@/utils/location";
import { formatarData, formatarHora, labelTipoPonto } from "@/utils/format";
import { RegistroPonto } from "@/types";

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

  async function handleRegistro(tipo: "entrada" | "saida" | "pausa") {
    if (!user || !perfil) return;
    setCarregando(true);
    setStatus("Obtendo localização...");
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
        // localização opcional
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
      <p className="eyebrow">Ponto Eletrônico</p>
      <h1 className="screen-title">Registro de Ponto</h1>

      <div className="ponto-hero">
        <div className="ponto-clock">{hora}</div>
        <div className="ponto-date">{formatarData(new Date().toISOString())}</div>
        {ultimoPonto && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 16 }}>
            Último registro: <strong>{labelTipoPonto(ultimoPonto.tipo)}</strong> às {formatarHora(ultimoPonto.dataHora)}
          </p>
        )}
        <div className="ponto-btns">
          <button className="btn btn-primary" onClick={() => handleRegistro("entrada")} disabled={carregando}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1={15} y1={12} x2={3} y2={12} />
            </svg>
            Registrar Entrada
          </button>
          <button className="btn btn-secondary" onClick={() => handleRegistro("pausa")} disabled={carregando}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <rect x={6} y={4} width={4} height={16} />
              <rect x={14} y={4} width={4} height={16} />
            </svg>
            Registrar Pausa
          </button>
          <button className="btn btn-danger" onClick={() => handleRegistro("saida")} disabled={carregando}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1={21} y1={12} x2={9} y2={12} />
            </svg>
            Registrar Saída
          </button>
        </div>
        <p className={`status-msg ${statusTipo}`}>{status}</p>
      </div>

      <div className="card">
        <p className="card-title">Histórico do Mês</p>
        {historico.length === 0 ? (
          <p className="empty">Nenhum registro este mês.</p>
        ) : (
          historico.map((r) => (
            <div key={r.id} className="history-item">
              <div className="history-item-left">
                <strong>{labelTipoPonto(r.tipo)}</strong>
                <span>{r.enderecoAproximado ?? "Localização não disponível"}</span>
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
