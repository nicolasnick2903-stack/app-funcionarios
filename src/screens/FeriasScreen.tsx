import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { solicitarFerias, buscarMinhasFerias } from "@/services/ferias";
import { formatarData, labelStatus, diasEntre } from "@/utils/format";
import { SolicitacaoFerias } from "@/types";

export default function FeriasScreen() {
  const { user, perfil } = useAuth();
  const [lista, setLista] = useState<SolicitacaoFerias[]>([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [obs, setObs] = useState("");
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) buscarMinhasFerias(user.uid).then(setLista);
  }, [user]);

  async function handleSolicitar(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !perfil) return;
    if (!inicio || !fim) {
      setStatusTipo("error");
      setStatus("Informe as datas de início e fim.");
      return;
    }
    if (new Date(fim) < new Date(inicio)) {
      setStatusTipo("error");
      setStatus("A data de fim deve ser após a data de início.");
      return;
    }
    setCarregando(true);
    setStatus("Enviando solicitação...");
    setStatusTipo("");
    try {
      await solicitarFerias(user.uid, perfil.nome, inicio, fim, obs);
      setStatusTipo("success");
      setStatus("Solicitação enviada com sucesso!");
      setInicio("");
      setFim("");
      setObs("");
      const novaLista = await buscarMinhasFerias(user.uid);
      setLista(novaLista);
    } catch {
      setStatusTipo("error");
      setStatus("Erro ao enviar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="screen">
      <p className="eyebrow">Gestão de Férias</p>
      <h1 className="screen-title">Férias</h1>

      <div className="card">
        <p className="card-title">Nova Solicitação</p>
        <form onSubmit={handleSolicitar}>
          <div className="field">
            <label>Data de Início</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
          </div>
          <div className="field">
            <label>Data de Fim</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} required />
          </div>
          {inicio && fim && new Date(fim) >= new Date(inicio) && (
            <p style={{ color: "var(--gold-soft)", fontSize: "0.85rem", marginBottom: 12 }}>
              Total: <strong>{diasEntre(inicio, fim)} dias</strong>
            </p>
          )}
          <div className="field">
            <label>Observação (opcional)</label>
            <textarea
              placeholder="Alguma informação adicional..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={carregando}>
            Solicitar Férias
          </button>
          <p className={`status-msg ${statusTipo}`}>{status}</p>
        </form>
      </div>

      <div className="card">
        <p className="card-title">Minhas Solicitações</p>
        {lista.length === 0 ? (
          <p className="empty">Nenhuma solicitação ainda.</p>
        ) : (
          lista.map((s) => (
            <div key={s.id} className="history-item">
              <div className="history-item-left">
                <strong>{formatarData(s.dataInicio)} → {formatarData(s.dataFim)}</strong>
                <span>{s.diasSolicitados} dias</span>
                {s.motivoRejeicao && (
                  <span style={{ color: "var(--danger)", fontSize: "0.78rem" }}>
                    Motivo: {s.motivoRejeicao}
                  </span>
                )}
              </div>
              <span className={`badge badge-${s.status}`}>{labelStatus(s.status)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
