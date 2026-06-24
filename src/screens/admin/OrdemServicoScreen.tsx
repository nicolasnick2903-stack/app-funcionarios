import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarOS, buscarOS, excluirOS, atualizarStatusOS } from "@/services/ordemServico";
import { OrdemServico, StatusOS } from "@/types";

const SERVICOS = ["Portaria", "Limpeza", "Zeladoria", "Segurança Patrimonial", "Controle de Acesso", "Facilities Corporativas"];
const STATUS: StatusOS[] = ["pendente", "andamento", "concluido", "cancelado"];
const STATUS_LABEL: Record<StatusOS, string> = { pendente: "Pendente", andamento: "Em andamento", concluido: "Concluído", cancelado: "Cancelado" };
const STATUS_COLOR: Record<StatusOS, string> = { pendente: "var(--gold-soft)", andamento: "#6ec6f5", concluido: "#5dd99a", cancelado: "var(--danger)" };

function fmt(d: string) { if (!d) return "—"; const [y,m,dd] = d.split("-"); return `${dd}/${m}/${y}`; }

export default function OrdemServicoScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [busca, setBusca] = useState("");

  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [cliente, setCliente] = useState("");
  const [local, setLocal] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [tipoServico, setTipoServico] = useState(SERVICOS[0]);
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<StatusOS>("pendente");
  const [assinatura, setAssinatura] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarOS());
    setCarregando(false);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true); setStatusMsg("");
    try {
      await criarOS({ data, cliente, local, funcionario, tipoServico, descricao, status, assinatura: assinatura || undefined }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("OS criada!");
      setMostrarForm(false); limparForm(); await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta OS?")) return;
    await excluirOS(id); await carregar();
  }

  async function handleStatus(id: string, s: StatusOS) {
    await atualizarStatusOS(id, s); await carregar();
  }

  function limparForm() {
    setCliente(""); setLocal(""); setFuncionario(""); setDescricao(""); setAssinatura("");
    setTipoServico(SERVICOS[0]); setStatus("pendente");
    setData(new Date().toISOString().slice(0, 10));
  }

  const filtrada = busca ? lista.filter(x => [x.cliente, x.funcionario, x.local, x.numero].join(" ").toLowerCase().includes(busca.toLowerCase())) : lista;

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Operacional</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Ordem de Serviço</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova OS"}
        </button>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <input type="text" placeholder="Buscar por cliente, funcionário, local..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Ordem de Serviço</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Data *</label><input type="date" value={data} onChange={e => setData(e.target.value)} required /></div>
            <div className="field"><label>Cliente / Condomínio *</label><input type="text" placeholder="Nome do cliente" value={cliente} onChange={e => setCliente(e.target.value)} required /></div>
            <div className="field"><label>Local / Posto *</label><input type="text" placeholder="Local do serviço" value={local} onChange={e => setLocal(e.target.value)} required /></div>
            <div className="field"><label>Funcionário Responsável *</label><input type="text" placeholder="Nome do funcionário" value={funcionario} onChange={e => setFuncionario(e.target.value)} required /></div>
            <div className="field"><label>Tipo de Serviço *</label>
              <select value={tipoServico} onChange={e => setTipoServico(e.target.value)}>
                {SERVICOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as StatusOS)}>
                {STATUS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="field"><label>Descrição do Trabalho *</label><textarea placeholder="Descreva o serviço a ser realizado..." value={descricao} onChange={e => setDescricao(e.target.value)} required /></div>
            <div className="field"><label>Assinatura do Cliente</label><input type="text" placeholder="Nome de quem assinou" value={assinatura} onChange={e => setAssinatura(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Criar OS"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : filtrada.length === 0 ? (
        <p className="empty">Nenhuma OS encontrada.</p>
      ) : filtrada.map(os => (
        <div key={os.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--gold-soft)", marginBottom: 2 }}>{os.numero}</p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{os.cliente}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{os.tipoServico} · {os.local}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Func: {os.funcionario} · {fmt(os.data)}</p>
              {os.descricao && <p style={{ fontSize: "0.78rem", marginTop: 6, color: "var(--text)", opacity: 0.85 }}>{os.descricao}</p>}
              {os.assinatura && <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>✍️ {os.assinatura}</p>}
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[os.status], flexShrink: 0, padding: "3px 8px", background: "rgba(255,255,255,.06)", borderRadius: 20 }}>
              {STATUS_LABEL[os.status]}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {STATUS.filter(s => s !== os.status).map(s => (
              <button key={s} onClick={() => handleStatus(os.id, s)}
                style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(255,255,255,.06)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--muted)", cursor: "pointer" }}>
                → {STATUS_LABEL[s]}
              </button>
            ))}
            <button onClick={() => handleExcluir(os.id)}
              style={{ fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer", marginLeft: "auto" }}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
