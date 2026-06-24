import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarRecibo, buscarRecibos, excluirRecibo } from "@/services/recibo";
import { ReciboServico } from "@/types";

function fmt(d: string) { if (!d) return "—"; const [y,m,dd] = d.split("-"); return `${dd}/${m}/${y}`; }
function fmtVal(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function ReciboScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<ReciboServico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [cliente, setCliente] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarRecibos());
    setCarregando(false);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) { setStatusTipo("error"); setStatusMsg("Valor inválido."); return; }
    setSalvando(true); setStatusMsg("");
    try {
      await criarRecibo({ data, cliente, cnpjCpf: cnpjCpf || undefined, valor: v, descricao, obs: obs || undefined }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("Recibo criado!");
      setMostrarForm(false); setCliente(""); setCnpjCpf(""); setValor(""); setDescricao(""); setObs("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este recibo?")) return;
    await excluirRecibo(id); await carregar();
  }

  const total = lista.reduce((s, r) => s + r.valor, 0);

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Financeiro</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Recibo de Serviços</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Novo Recibo"}
        </button>
      </div>

      {lista.length > 0 && (
        <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Total emitido</p>
          <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--gold-soft)", marginTop: 4 }}>{fmtVal(total)}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{lista.length} recibo(s)</p>
        </div>
      )}

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Novo Recibo de Serviços</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Data *</label><input type="date" value={data} onChange={e => setData(e.target.value)} required /></div>
            <div className="field"><label>Cliente / Pagador *</label><input type="text" placeholder="Nome do cliente" value={cliente} onChange={e => setCliente(e.target.value)} required /></div>
            <div className="field"><label>CNPJ / CPF</label><input type="text" placeholder="00.000.000/0001-00" value={cnpjCpf} onChange={e => setCnpjCpf(e.target.value)} /></div>
            <div className="field"><label>Valor (R$) *</label><input type="number" step="0.01" min="0" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} required /></div>
            <div className="field"><label>Descrição do Serviço *</label><textarea placeholder="Referente a..." value={descricao} onChange={e => setDescricao(e.target.value)} required /></div>
            <div className="field"><label>Observações</label><textarea placeholder="Informações adicionais..." value={obs} onChange={e => setObs(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Emitir Recibo"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhum recibo emitido.</p>
      ) : lista.map(r => (
        <div key={r.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--gold-soft)", marginBottom: 2 }}>{r.numero}</p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{r.cliente}</p>
              {r.cnpjCpf && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Doc: {r.cnpjCpf}</p>}
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Data: {fmt(r.data)}</p>
              <p style={{ fontSize: "0.82rem", marginTop: 6 }}>{r.descricao}</p>
              {r.obs && <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>{r.obs}</p>}
            </div>
            <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--gold-soft)", flexShrink: 0 }}>{fmtVal(r.valor)}</p>
          </div>
          <button onClick={() => handleExcluir(r.id)}
            style={{ marginTop: 10, fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}>
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}
