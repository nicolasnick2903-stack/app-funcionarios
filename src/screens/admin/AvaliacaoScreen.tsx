import { useState, useEffect } from "react";
import { criarAvaliacao, buscarAvaliacoes, excluirAvaliacao } from "@/services/avaliacao";
import { AvaliacaoDesempenho } from "@/types";

const CRITERIOS = [
  "Pontualidade e assiduidade",
  "Apresentação e uniforme",
  "Postura e atendimento",
  "Cooperação e proatividade",
  "Qualidade do trabalho",
];

function media(criterios: Record<string, number>) {
  const vals = Object.values(criterios).filter(v => v > 0);
  if (!vals.length) return "—";
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
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

export default function AvaliacaoScreen() {
  const [lista, setLista] = useState<AvaliacaoDesempenho[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const [funcionario, setFuncionario] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [avaliador, setAvaliador] = useState("");
  const [criterios, setCriterios] = useState<Record<string, number>>({});
  const [obs, setObs] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarAvaliacoes());
    setCarregando(false);
  }

  function setNota(crit: string, val: number) {
    setCriterios(prev => ({ ...prev, [crit]: prev[crit] === val ? 0 : val }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setStatusMsg("");
    try {
      await criarAvaliacao({ funcionario, periodo, avaliador, criterios, obs: obs || undefined });
      setStatusTipo("success"); setStatusMsg("Avaliação salva!");
      setMostrarForm(false); setFuncionario(""); setPeriodo(""); setAvaliador(""); setCriterios({}); setObs("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    await excluirAvaliacao(id); await carregar();
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">RH / Funcionários</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Avaliação de Desempenho</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova Avaliação"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Avaliação de Desempenho</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Funcionário *</label><input type="text" placeholder="Nome do funcionário" value={funcionario} onChange={e => setFuncionario(e.target.value)} required /></div>
            <div className="field"><label>Período de Referência *</label><input type="text" placeholder="Ex: Junho/2025" value={periodo} onChange={e => setPeriodo(e.target.value)} required /></div>
            <div className="field"><label>Avaliador</label><input type="text" placeholder="Nome do avaliador" value={avaliador} onChange={e => setAvaliador(e.target.value)} /></div>

            <div className="field">
              <label>Critérios — nota de 1 a 5</label>
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

            <div className="field"><label>Observações</label><textarea placeholder="Pontos positivos, de melhoria..." value={obs} onChange={e => setObs(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Avaliação"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhuma avaliação registrada.</p>
      ) : lista.map(av => {
        const med = media(av.criterios || {});
        const cor = Number(med) >= 4 ? "#5dd99a" : Number(med) >= 3 ? "var(--gold-soft)" : "var(--danger)";
        return (
          <div key={av.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{av.funcionario}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Período: {av.periodo}</p>
                {av.avaliador && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Avaliador: {av.avaliador}</p>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {CRITERIOS.map(c => (
                    <span key={c} style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {c.split(" ")[0]}: <strong style={{ color: "var(--text)" }}>{av.criterios?.[c] || "—"}</strong>
                    </span>
                  ))}
                </div>
                {av.obs && <p style={{ fontSize: "0.78rem", marginTop: 6, opacity: 0.8 }}>{av.obs}</p>}
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 900, color: cor }}>{med}</p>
                <p style={{ fontSize: "0.65rem", color: "var(--muted)" }}>média</p>
              </div>
            </div>
            <button onClick={() => handleExcluir(av.id)}
              style={{ marginTop: 10, fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}>
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}
