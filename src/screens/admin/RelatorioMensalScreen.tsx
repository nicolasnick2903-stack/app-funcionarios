import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarRelatorio, buscarRelatorios, excluirRelatorio, atualizarStatusRelatorio } from "@/services/relatorio";
import { RelatorioMensal, StatusRelatorio } from "@/types";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const STATUS_LABEL: Record<StatusRelatorio, string> = { rascunho: "Rascunho", enviado: "Enviado", aprovado: "Aprovado" };
const STATUS_COLOR: Record<StatusRelatorio, string> = { rascunho: "var(--muted)", enviado: "var(--gold-soft)", aprovado: "#5dd99a" };

export default function RelatorioMensalScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<RelatorioMensal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const hoje = new Date();
  const [mes, setMes] = useState(MESES[hoje.getMonth()]);
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [cliente, setCliente] = useState("");
  const [osRealizadas, setOsRealizadas] = useState("");
  const [ocorrencias, setOcorrencias] = useState("");
  const [indiceQualidade, setIndiceQualidade] = useState("");
  const [satisfacao, setSatisfacao] = useState("");
  const [servicos, setServicos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<StatusRelatorio>("rascunho");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarRelatorios());
    setCarregando(false);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true); setStatusMsg("");
    try {
      await criarRelatorio({ mes, ano, cliente, osRealizadas, ocorrencias, indiceQualidade, satisfacao, servicos, observacoes, status }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("Relatório criado!");
      setMostrarForm(false); setCliente(""); setServicos(""); setObservacoes("");
      setOsRealizadas(""); setOcorrencias(""); setIndiceQualidade(""); setSatisfacao("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este relatório?")) return;
    await excluirRelatorio(id); await carregar();
  }

  async function handleStatus(id: string, s: StatusRelatorio) {
    await atualizarStatusRelatorio(id, s); await carregar();
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Operacional</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Relatório Mensal</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Novo Relatório"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Novo Relatório Mensal</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Mês *</label>
              <select value={mes} onChange={e => setMes(e.target.value)}>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field"><label>Ano *</label><input type="text" placeholder="2025" value={ano} onChange={e => setAno(e.target.value)} required /></div>
            <div className="field"><label>Cliente / Condomínio *</label><input type="text" placeholder="Nome do cliente" value={cliente} onChange={e => setCliente(e.target.value)} required /></div>
            <div className="field"><label>OS Realizadas</label><input type="text" placeholder="Ex: 12" value={osRealizadas} onChange={e => setOsRealizadas(e.target.value)} /></div>
            <div className="field"><label>Nº de Ocorrências</label><input type="text" placeholder="Ex: 2" value={ocorrencias} onChange={e => setOcorrencias(e.target.value)} /></div>
            <div className="field"><label>Índice de Qualidade (%)</label><input type="text" placeholder="Ex: 94" value={indiceQualidade} onChange={e => setIndiceQualidade(e.target.value)} /></div>
            <div className="field"><label>Nota de Satisfação (1–5)</label><input type="text" placeholder="Ex: 4.5" value={satisfacao} onChange={e => setSatisfacao(e.target.value)} /></div>
            <div className="field"><label>Serviços Realizados</label><textarea placeholder="Descreva os serviços do período..." value={servicos} onChange={e => setServicos(e.target.value)} /></div>
            <div className="field"><label>Observações do Gestor</label><textarea placeholder="Observações gerais..." value={observacoes} onChange={e => setObservacoes(e.target.value)} /></div>
            <div className="field"><label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as StatusRelatorio)}>
                {(Object.keys(STATUS_LABEL) as StatusRelatorio[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Relatório"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhum relatório criado.</p>
      ) : lista.map(r => (
        <div key={r.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--gold-soft)", marginBottom: 2 }}>{r.mes}/{r.ano}</p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{r.cliente}</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {r.osRealizadas && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>OS: {r.osRealizadas}</p>}
                {r.ocorrencias && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Ocorrências: {r.ocorrencias}</p>}
                {r.indiceQualidade && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Qualidade: {r.indiceQualidade}%</p>}
                {r.satisfacao && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Satisfação: {r.satisfacao}/5</p>}
              </div>
              {r.observacoes && <p style={{ fontSize: "0.78rem", marginTop: 6, opacity: 0.8 }}>{r.observacoes}</p>}
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[r.status], flexShrink: 0, padding: "3px 8px", background: "rgba(255,255,255,.06)", borderRadius: 20 }}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {r.status !== "enviado" && <button onClick={() => handleStatus(r.id, "enviado")} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(255,255,255,.06)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--muted)", cursor: "pointer" }}>→ Enviado</button>}
            {r.status !== "aprovado" && <button onClick={() => handleStatus(r.id, "aprovado")} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(42,125,79,.12)", border: "1px solid rgba(42,125,79,.3)", borderRadius: 6, color: "#5dd99a", cursor: "pointer" }}>→ Aprovado</button>}
            <button onClick={() => handleExcluir(r.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer", marginLeft: "auto" }}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
