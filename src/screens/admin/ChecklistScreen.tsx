import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarChecklist, buscarChecklists, excluirChecklist } from "@/services/checklist";
import { Checklist } from "@/types";

const ITENS = [
  "Apresentação e uniforme da equipe",
  "Limpeza das áreas comuns",
  "Portaria organizada e limpa",
  "Equipamentos em bom estado",
  "Postura e conduta dos colaboradores",
  "Registro de visitas atualizado",
  "Iluminação das áreas verificada",
  "Lixeiras limpas e no local correto",
  "Elevadores e corredores limpos",
  "Área externa limpa",
  "Banheiros higienizados",
  "Sala de lixo organizada",
  "Portão/cancela funcionando",
  "Material de limpeza estocado",
  "Ocorrências registradas corretamente",
];

const NOTA_COLOR: Record<string, string> = { otimo: "#5dd99a", bom: "var(--gold-soft)", regular: "#f2a65a", ruim: "var(--danger)" };
const NOTA_LABEL: Record<string, string> = { otimo: "Ótimo", bom: "Bom", regular: "Regular", ruim: "Ruim" };

function fmt(d: string) { if (!d) return "—"; const [y,m,dd] = d.split("-"); return `${dd}/${m}/${y}`; }

export default function ChecklistScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<Checklist[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");

  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<"diaria" | "semanal">("diaria");
  const [supervisor, setSupervisor] = useState("");
  const [local, setLocal] = useState("");
  const [items, setItems] = useState<Record<string, boolean>>({});
  const [nota, setNota] = useState<"otimo" | "bom" | "regular" | "ruim">("bom");
  const [obs, setObs] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setLista(await buscarChecklists());
    setCarregando(false);
  }

  function toggleItem(item: string) {
    setItems(prev => ({ ...prev, [item]: !prev[item] }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true); setStatusMsg("");
    try {
      await criarChecklist({ data, tipo, supervisor, local, items, nota, obs: obs || undefined }, perfil.nome);
      setStatusTipo("success"); setStatusMsg("Checklist salvo!");
      setMostrarForm(false); setItems({}); setSupervisor(""); setLocal(""); setObs("");
      await carregar();
    } catch { setStatusTipo("error"); setStatusMsg("Erro ao salvar."); }
    finally { setSalvando(false); }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este checklist?")) return;
    await excluirChecklist(id); await carregar();
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Operacional</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Checklist de Supervisão</h1>
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => { setMostrarForm(!mostrarForm); setStatusMsg(""); }}>
          {mostrarForm ? "Cancelar" : "+ Nova Vistoria"}
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Nova Vistoria</p>
          <form onSubmit={handleSalvar}>
            <div className="field"><label>Data *</label><input type="date" value={data} onChange={e => setData(e.target.value)} required /></div>
            <div className="field"><label>Tipo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value as "diaria" | "semanal")}>
                <option value="diaria">Diária</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            <div className="field"><label>Supervisor *</label><input type="text" placeholder="Nome do supervisor" value={supervisor} onChange={e => setSupervisor(e.target.value)} required /></div>
            <div className="field"><label>Local / Posto *</label><input type="text" placeholder="Local da vistoria" value={local} onChange={e => setLocal(e.target.value)} required /></div>

            <div className="field">
              <label>Itens Verificados</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--input-bg, rgba(255,255,255,.04))", borderRadius: 8, padding: 12, border: "1px solid var(--line)" }}>
                {ITENS.map(item => (
                  <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={!!items[item]} onChange={() => toggleItem(item)}
                      style={{ width: 16, height: 16, accentColor: "var(--gold)", flexShrink: 0 }} />
                    {item}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 6 }}>
                {Object.values(items).filter(Boolean).length}/{ITENS.length} itens OK
              </p>
            </div>

            <div className="field"><label>Avaliação Geral</label>
              <select value={nota} onChange={e => setNota(e.target.value as typeof nota)}>
                {Object.entries(NOTA_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field"><label>Observações</label><textarea placeholder="Observações da vistoria..." value={obs} onChange={e => setObs(e.target.value)} /></div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Checklist"}</button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {carregando ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <p className="empty">Nenhuma vistoria registrada.</p>
      ) : lista.map(c => {
        const ok = Object.values(c.items || {}).filter(Boolean).length;
        const total = ITENS.length;
        return (
          <div key={c.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{c.tipo === "diaria" ? "Vistoria Diária" : "Vistoria Semanal"} — {fmt(c.data)}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Supervisor: {c.supervisor} · {c.local}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>{ok}/{total} itens OK</p>
                {c.obs && <p style={{ fontSize: "0.78rem", marginTop: 6, opacity: 0.8 }}>{c.obs}</p>}
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: NOTA_COLOR[c.nota], flexShrink: 0, padding: "3px 8px", background: "rgba(255,255,255,.06)", borderRadius: 20 }}>
                {NOTA_LABEL[c.nota]}
              </span>
            </div>
            <button onClick={() => handleExcluir(c.id)}
              style={{ marginTop: 10, fontSize: "0.72rem", padding: "4px 10px", background: "rgba(185,74,72,.12)", border: "1px solid rgba(185,74,72,.3)", borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}>
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}
