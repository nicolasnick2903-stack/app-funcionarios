import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  buscarTodasFerias,
  atualizarStatusFerias,
  programarFerias,
} from "@/services/ferias";
import { buscarTodosFuncionarios } from "@/services/funcionario";
import { formatarData, labelStatus, diasEntre } from "@/utils/format";
import { SolicitacaoFerias, Usuario } from "@/types";

export default function AdminFeriasScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<SolicitacaoFerias[]>([]);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formUid, setFormUid] = useState("");
  const [formInicio, setFormInicio] = useState("");
  const [formFim, setFormFim] = useState("");
  const [formObs, setFormObs] = useState("");
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregar();
    buscarTodosFuncionarios().then(setFuncionarios);
  }, []);

  async function carregar() {
    setCarregando(true);
    const todas = await buscarTodasFerias();
    setLista(todas);
    setCarregando(false);
  }

  async function handleAprovar(id: string) {
    if (!perfil) return;
    await atualizarStatusFerias(id, "aprovado", perfil.nome);
    await carregar();
  }

  async function handleRejeitar(id: string) {
    if (!perfil || !motivoRejeicao.trim()) return;
    await atualizarStatusFerias(id, "rejeitado", perfil.nome, motivoRejeicao);
    setRejeitandoId(null);
    setMotivoRejeicao("");
    await carregar();
  }

  async function handleProgramar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !formUid || !formInicio || !formFim) {
      setStatusTipo("error");
      setStatus("Preencha todos os campos.");
      return;
    }
    setCarregando(true);
    setStatus("Programando férias...");
    setStatusTipo("");
    try {
      const func = funcionarios.find((f) => f.uid === formUid);
      await programarFerias(formUid, func?.nome ?? "—", formInicio, formFim, perfil.nome, formObs);
      setStatusTipo("success");
      setStatus("Férias programadas com sucesso!");
      setFormUid("");
      setFormInicio("");
      setFormFim("");
      setFormObs("");
      setMostrarForm(false);
      await carregar();
    } catch {
      setStatusTipo("error");
      setStatus("Erro ao programar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const pendentes = lista.filter((s) => s.status === "pendente");
  const demais = lista.filter((s) => s.status !== "pendente");

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Férias</h1>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Cancelar" : "+ Programar"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Programar Férias</p>
          <form onSubmit={handleProgramar}>
            <div className="field">
              <label>Funcionário</label>
              <select value={formUid} onChange={(e) => setFormUid(e.target.value)} required>
                <option value="">Selecione...</option>
                {funcionarios.filter((f) => f.ativo).map((f) => (
                  <option key={f.uid} value={f.uid}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Data de Início</label>
              <input type="date" value={formInicio} onChange={(e) => setFormInicio(e.target.value)} required />
            </div>
            <div className="field">
              <label>Data de Fim</label>
              <input type="date" value={formFim} onChange={(e) => setFormFim(e.target.value)} required />
            </div>
            {formInicio && formFim && new Date(formFim) >= new Date(formInicio) && (
              <p style={{ color: "var(--gold-soft)", fontSize: "0.85rem", marginBottom: 12 }}>
                Total: <strong>{diasEntre(formInicio, formFim)} dias</strong>
              </p>
            )}
            <div className="field">
              <label>Observação</label>
              <textarea placeholder="Opcional..." value={formObs} onChange={(e) => setFormObs(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={carregando}>
              Confirmar Programação
            </button>
            {status && <p className={`status-msg ${statusTipo}`}>{status}</p>}
          </form>
        </div>
      )}

      {pendentes.length > 0 && (
        <>
          <p className="card-title" style={{ marginBottom: 10 }}>Aguardando Aprovação ({pendentes.length})</p>
          {pendentes.map((s) => (
            <div key={s.id} className="card" style={{ marginBottom: 12, borderLeft: "3px solid var(--gold)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.nomeFunc}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {formatarData(s.dataInicio)} → {formatarData(s.dataFim)} · {s.diasSolicitados} dias
                  </p>
                  {s.observacao && (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>{s.observacao}</p>
                  )}
                </div>
                <span className="badge badge-pendente">Pendente</span>
              </div>
              {rejeitandoId === s.id ? (
                <div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Motivo da rejeição"
                      value={motivoRejeicao}
                      onChange={(e) => setMotivoRejeicao(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleRejeitar(s.id)}>
                      Confirmar Rejeição
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRejeitandoId(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAprovar(s.id)}>
                    Aprovar
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { setRejeitandoId(s.id); setMotivoRejeicao(""); }}>
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {demais.length > 0 && (
        <>
          <p className="card-title" style={{ marginBottom: 10, marginTop: 16 }}>Histórico</p>
          {demais.map((s) => (
            <div key={s.id} className="history-item" style={{ marginBottom: 10 }}>
              <div className="history-item-left">
                <strong>{s.nomeFunc}</strong>
                <span>{formatarData(s.dataInicio)} → {formatarData(s.dataFim)} · {s.diasSolicitados} dias</span>
                {s.aprovadoPor && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Por: {s.aprovadoPor}</span>
                )}
                {s.motivoRejeicao && (
                  <span style={{ fontSize: "0.75rem", color: "var(--danger)" }}>{s.motivoRejeicao}</span>
                )}
              </div>
              <span className={`badge badge-${s.status}`}>{labelStatus(s.status)}</span>
            </div>
          ))}
        </>
      )}

      {!carregando && lista.length === 0 && <p className="empty">Nenhuma solicitação de férias.</p>}
    </div>
  );
}
