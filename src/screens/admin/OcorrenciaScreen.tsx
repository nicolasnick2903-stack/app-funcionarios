import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarOcorrencia, buscarOcorrencias, excluirOcorrencia, atualizarStatusOcorrencia } from "@/services/ocorrencia";
import { Ocorrencia, StatusOcorrencia, TipoOcorrencia } from "@/types";

const TIPOS: TipoOcorrencia[] = ["incidente", "reclamacao", "irregularidade", "acidente", "perda", "outro"];
const TIPO_LABEL: Record<TipoOcorrencia, string> = { incidente: "Incidente", reclamacao: "Reclamação", irregularidade: "Irregularidade", acidente: "Acidente", perda: "Perda de Material", outro: "Outro" };
const STATUS_COLOR: Record<StatusOcorrencia, string> = { aberta: "var(--gold-soft)", analise: "#6ec6f5", encerrada: "#5dd99a" };
const STATUS_LABEL: Record<StatusOcorrencia, string> = { aberta: "Aberta", analise: "Em análise", encerrada: "Encerrada" };

export default function OcorrenciaScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const [dataHora, setDataHora] = useState(new Date().toISOString().slice(0, 16));
  const [tipo, setTipo] = useState<TipoOcorrencia>("incidente");
  const [local, setLocal] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [relato, setRelato] = useState("");
  const [providencias, setProvidencias] = useState("");
  const [status, setStatus] = useState<StatusOcorrencia>("aberta");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarOcorrencias());
    setCarregando(false);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true); setStatusMsg("");
    try {
      await criarOcorrencia({ dataHora, tipo, local, funcionario: funcionario || undefined, relato, providencias: providencias || undefined, status }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("Ocorrência registrada!");
      setMostrarForm(false); setLocal(""); setFuncionario(""); setRelato(""); setProvidencias("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta ocorrência?")) return;
    await excluirOcorrencia(id); await carregar();
  }

  async function handleStatus(id: string, s: StatusOcorrencia) {
    await atualizarStatusOcorrencia(id, s); await carregar();
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Operacional</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Ficha de Ocorrência</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova Ocorrência"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Ficha de Ocorrência</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Data e Hora *</label><input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} required /></div>
            <div className="field"><label>Tipo *</label>
              <select value={tipo} onChange={e => setTipo(e.target.value as TipoOcorrencia)}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
              </select>
            </div>
            <div className="field"><label>Local *</label><input type="text" placeholder="Local da ocorrência" value={local} onChange={e => setLocal(e.target.value)} required /></div>
            <div className="field"><label>Funcionário Envolvido</label><input type="text" placeholder="Nome (opcional)" value={funcionario} onChange={e => setFuncionario(e.target.value)} /></div>
            <div className="field"><label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as StatusOcorrencia)}>
                {(Object.keys(STATUS_LABEL) as StatusOcorrencia[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="field"><label>Relato da Ocorrência *</label><textarea placeholder="Descreva o que aconteceu..." value={relato} onChange={e => setRelato(e.target.value)} required /></div>
            <div className="field"><label>Providências Tomadas</label><textarea placeholder="Ações realizadas..." value={providencias} onChange={e => setProvidencias(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Registrar Ocorrência"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhuma ocorrência registrada.</p>
      ) : lista.map(oc => (
        <div key={oc.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--gold-soft)", marginBottom: 2 }}>{oc.numero} · {TIPO_LABEL[oc.tipo]}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{new Date(oc.dataHora).toLocaleString("pt-BR")} · {oc.local}</p>
              {oc.funcionario && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Func: {oc.funcionario}</p>}
              <p style={{ fontSize: "0.82rem", marginTop: 6 }}>{oc.relato}</p>
              {oc.providencias && <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>Providências: {oc.providencias}</p>}
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[oc.status], flexShrink: 0, padding: "3px 8px", background: "rgba(255,255,255,.06)", borderRadius: 20 }}>
              {STATUS_LABEL[oc.status]}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {oc.status !== "analise" && <button onClick={() => handleStatus(oc.id, "analise")} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(26,107,154,.12)", border: "1px solid rgba(26,107,154,.3)", borderRadius: 6, color: "#6ec6f5", cursor: "pointer" }}>→ Em análise</button>}
            {oc.status !== "encerrada" && <button onClick={() => handleStatus(oc.id, "encerrada")} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(42,125,79,.12)", border: "1px solid rgba(42,125,79,.3)", borderRadius: 6, color: "#5dd99a", cursor: "pointer" }}>→ Encerrada</button>}
            <button onClick={() => handleExcluir(oc.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer", marginLeft: "auto" }}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
