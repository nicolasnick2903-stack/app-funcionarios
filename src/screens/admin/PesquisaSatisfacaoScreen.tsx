import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarPesquisa, buscarPesquisas, excluirPesquisa } from "@/services/pesquisaSatisfacao";
import { PesquisaSatisfacao } from "@/types";

const CRITERIOS = [
  "Qualidade do serviço",
  "Pontualidade da equipe",
  "Comunicação / Atendimento",
  "Profissionalismo dos colaboradores",
];

function media(criterios: Record<string, number>) {
  const vals = Object.values(criterios).filter(v => v > 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function NotaBtn({ val, ativo, onClick }: { val: number; ativo: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 6, border: "1px solid var(--line)",
        background: ativo ? "var(--gold)" : "rgba(255,255,255,.04)",
        color: ativo ? "#050505" : "var(--muted)",
        fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", transition: ".15s",
      }}>
      {val}
    </button>
  );
}

export default function PesquisaSatisfacaoScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<PesquisaSatisfacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const [cliente, setCliente] = useState("");
  const [mes, setMes] = useState("");
  const [criterios, setCriterios] = useState<Record<string, number>>({});
  const [comentario, setComentario] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarPesquisas());
    setCarregando(false);
  }

  function setNota(crit: string, val: number) {
    setCriterios(prev => ({ ...prev, [crit]: prev[crit] === val ? 0 : val }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true); setStatusMsg("");
    try {
      await criarPesquisa({ cliente, mes, criterios, comentario: comentario || undefined }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("Pesquisa salva!");
      setMostrarForm(false); setCliente(""); setMes(""); setCriterios({}); setComentario("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta pesquisa?")) return;
    await excluirPesquisa(id); await carregar();
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Clientes</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Pesquisa de Satisfação</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova Pesquisa"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Pesquisa de Satisfação</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Cliente *</label><input type="text" placeholder="Nome do cliente / condomínio" value={cliente} onChange={e => setCliente(e.target.value)} required /></div>
            <div className="field"><label>Mês de Referência *</label><input type="text" placeholder="Ex: Junho/2025" value={mes} onChange={e => setMes(e.target.value)} required /></div>

            <div className="field">
              <label>Avaliação — nota de 1 a 5</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "rgba(255,255,255,.04)", borderRadius: 8, border: "1px solid var(--line)" }}>
                {CRITERIOS.map(c => (
                  <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: "0.82rem", flex: 1 }}>{c}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(n => (
                        <NotaBtn key={n} val={n} ativo={criterios[c] === n} onClick={() => setNota(c, n)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="field"><label>Comentário / Sugestão</label><textarea placeholder="Feedback do cliente..." value={comentario} onChange={e => setComentario(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Pesquisa"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhuma pesquisa registrada.</p>
      ) : lista.map(p => {
        const med = media(p.criterios || {});
        const cor = med ? (med >= 4 ? "#5dd99a" : med >= 3 ? "var(--gold-soft)" : "var(--danger)") : "var(--muted)";
        return (
          <div key={p.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{p.cliente}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Mês: {p.mes}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {CRITERIOS.map(c => (
                    <span key={c} style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {c.split(" ")[0]}: <strong style={{ color: "var(--text)" }}>{p.criterios?.[c] || "—"}</strong>
                    </span>
                  ))}
                </div>
                {p.comentario && <p style={{ fontSize: "0.78rem", marginTop: 6, fontStyle: "italic", opacity: 0.85 }}>"{p.comentario}"</p>}
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 900, color: cor }}>{med ? med.toFixed(1) : "—"}</p>
                <p style={{ fontSize: "0.65rem", color: "var(--muted)" }}>média</p>
              </div>
            </div>
            <button onClick={() => handleExcluir(p.id)}
              style={{ marginTop: 10, fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}>
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}
