import { useState, useEffect } from "react";
import { criarEscala, buscarEscalas, excluirEscala } from "@/services/escala";
import { EscalaTrabalho } from "@/types";

const TURNOS = ["Manhã 06h–14h", "Tarde 14h–22h", "Noite 22h–06h", "Diurno 08h–17h", "12x36 Dia", "12x36 Noite"];
const DIAS = [
  { k: "seg", l: "Segunda" }, { k: "ter", l: "Terça" }, { k: "qua", l: "Quarta" },
  { k: "qui", l: "Quinta" }, { k: "sex", l: "Sexta" }, { k: "sab", l: "Sábado" }, { k: "dom", l: "Domingo" },
];

function fmt(d: string) { if (!d) return "—"; const [y,m,dd] = d.split("-"); return `${dd}/${m}/${y}`; }

export default function EscalaScreen() {
  const [lista, setLista] = useState<EscalaTrabalho[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [busca, setBusca] = useState("");

  const [funcionario, setFuncionario] = useState("");
  const [posto, setPosto] = useState("");
  const [turno, setTurno] = useState(TURNOS[0]);
  const [dias, setDias] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarEscalas());
    setCarregando(false);
  }

  function toggleDia(k: string) {
    setDias(prev => prev.includes(k) ? prev.filter(d => d !== k) : [...prev, k]);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setStatusMsg("");
    try {
      await criarEscala({ funcionario, posto, turno, dias, dataInicio, dataFim: dataFim || undefined, obs: obs || undefined });
      setStatusTipo("success"); setStatusMsg("Escala salva!");
      setMostrarForm(false); setFuncionario(""); setPosto(""); setDias([]); setObs(""); setDataFim("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta escala?")) return;
    await excluirEscala(id); await carregar();
  }

  const filtrada = busca ? lista.filter(x => [x.funcionario, x.posto, x.turno].join(" ").toLowerCase().includes(busca.toLowerCase())) : lista;

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">RH / Funcionários</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Escala de Trabalho</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova Escala"}
        </button>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <input type="text" placeholder="Buscar por funcionário ou posto..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Escala de Trabalho</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Funcionário *</label><input type="text" placeholder="Nome completo" value={funcionario} onChange={e => setFuncionario(e.target.value)} required /></div>
            <div className="field"><label>Posto / Local *</label><input type="text" placeholder="Local de trabalho" value={posto} onChange={e => setPosto(e.target.value)} required /></div>
            <div className="field"><label>Turno *</label>
              <select value={turno} onChange={e => setTurno(e.target.value)}>
                {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Dias da Semana</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 12, background: "rgba(255,255,255,.04)", borderRadius: 8, border: "1px solid var(--line)" }}>
                {DIAS.map(d => (
                  <label key={d.k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={dias.includes(d.k)} onChange={() => toggleDia(d.k)} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />
                    {d.l}
                  </label>
                ))}
              </div>
            </div>
            <div className="field"><label>Data de Início *</label><input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required /></div>
            <div className="field"><label>Data de Fim</label><input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></div>
            <div className="field"><label>Observações</label><textarea placeholder="Informações adicionais..." value={obs} onChange={e => setObs(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Escala"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : filtrada.length === 0 ? (
        <p className="empty">Nenhuma escala cadastrada.</p>
      ) : filtrada.map(esc => {
        const diasLabel = DIAS.filter(d => (esc.dias || []).includes(d.k)).map(d => d.l.slice(0, 3)).join(", ");
        return (
          <div key={esc.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{esc.funcionario}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Posto: {esc.posto}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Turno: {esc.turno}</p>
                {diasLabel && <p style={{ fontSize: "0.75rem", color: "var(--gold-soft)", marginTop: 4 }}>{diasLabel}</p>}
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                  {fmt(esc.dataInicio)}{esc.dataFim ? ` → ${fmt(esc.dataFim)}` : " em diante"}
                </p>
                {esc.obs && <p style={{ fontSize: "0.78rem", marginTop: 6, opacity: 0.8 }}>{esc.obs}</p>}
              </div>
            </div>
            <button onClick={() => handleExcluir(esc.id)}
              style={{ marginTop: 10, fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}>
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}
