import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { buscarTransacoesPorMes, lancarTransacao, excluirTransacao } from "@/services/financeiro";
import { buscarCondominios } from "@/services/condominio";
import { Transacao, Condominio, CategoriaTransacao } from "@/types";

const CATEGORIAS: { value: CategoriaTransacao; label: string }[] = [
  { value: "salario", label: "Salario" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "manutencao", label: "Manutencao" },
  { value: "material", label: "Material" },
  { value: "servico", label: "Servico" },
  { value: "taxa", label: "Taxa/Imposto" },
  { value: "outro", label: "Outro" },
];

function formatarValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mesAno(ano: number, mes: number) {
  return new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function FinanceiroScreen() {
  const { perfil } = useAuth();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [lista, setLista] = useState<Transacao[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "saida">("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaTransacao>("outro");
  const [condominioId, setCondominioId] = useState("");
  const [data, setData] = useState(hoje.toISOString().slice(0, 10));
  const [obs, setObs] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [salvando, setSalvando] = useState(false);
  const [filtroCondominio, setFiltroCondominio] = useState("");

  useEffect(() => { carregar(); }, [ano, mes]);
  useEffect(() => { buscarCondominios().then(setCondominios); }, []);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarTransacoesPorMes(ano, mes);
    setLista(dados);
    setCarregando(false);
  }

  const listaFiltrada = filtroCondominio
    ? lista.filter((t) => t.condominioId === filtroCondominio)
    : lista;

  const totalEntradas = listaFiltrada.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const totalSaidas = listaFiltrada.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  function navMes(dir: number) {
    let nm = mes + dir;
    let na = ano;
    if (nm < 1) { nm = 12; na--; }
    if (nm > 12) { nm = 1; na++; }
    setMes(nm);
    setAno(na);
  }

  async function handleLancar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !valor || !descricao) return;
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) { setStatusTipo("error"); setStatusMsg("Valor invalido."); return; }
    setSalvando(true);
    setStatusMsg("");
    try {
      const cond = condominios.find((c) => c.id === condominioId);
      await lancarTransacao(tipo, v, descricao, categoria, perfil.nome, data,
        condominioId || undefined, cond?.nome || undefined, obs || undefined);
      setStatusTipo("success");
      setStatusMsg("Lancamento registrado!");
      setValor(""); setDescricao(""); setObs(""); setCondominioId("");
      setData(new Date().toISOString().slice(0, 10));
      setMostrarForm(false);
      await carregar();
    } catch {
      setStatusTipo("error");
      setStatusMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este lancamento?")) return;
    await excluirTransacao(id);
    await carregar();
  }


  function exportarCSV() {
    const cab = ["Data", "Tipo", "Descricao", "Categoria", "Condominio", "Valor", "Lancado por"];
    const linhas = listaFiltrada.map((t) => [
      new Date(t.data + "T12:00:00").toLocaleDateString("pt-BR"),
      t.tipo === "entrada" ? "Entrada" : "Saida",
      t.descricao,
      CATEGORIAS.find((c) => c.value === t.categoria)?.label ?? t.categoria,
      t.condominioNome ?? "",
      t.valor.toFixed(2).replace(".", ","),
      t.criadoPor,
    ]);
    const csv = [cab, ...linhas].map((row) => row.map((c) => '"' + c + '"').join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financeiro_" + mesAno(ano, mes).replace(" de ", "_") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Financeiro</h1>
        </div>
        <button className="btn btn-primary"
          style={{ width: "auto", padding: "0 14px", minHeight: 40, fontSize: "0.82rem" }}
          onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Cancelar" : "+ Lancamento"}
        </button>
      </div>

      {/* Navegacao de mes */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button className="btn btn-secondary" style={{ width: "auto", padding: "0 12px", minHeight: 36 }} onClick={() => navMes(-1)}>
          &lt;
        </button>
        <span style={{ fontWeight: 700, textTransform: "capitalize" }}>{mesAno(ano, mes)}</span>
        <button className="btn btn-secondary" style={{ width: "auto", padding: "0 12px", minHeight: 36 }} onClick={() => navMes(1)}>
          &gt;
        </button>
      </div>

      {/* Resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div className="card" style={{ padding: "12px 8px", textAlign: "center", marginBottom: 0 }}>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>Entradas</p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--gold-soft)" }}>{formatarValor(totalEntradas)}</p>
        </div>
        <div className="card" style={{ padding: "12px 8px", textAlign: "center", marginBottom: 0 }}>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>Saidas</p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--danger)" }}>{formatarValor(totalSaidas)}</p>
        </div>
        <div className="card" style={{ padding: "12px 8px", textAlign: "center", marginBottom: 0 }}>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>Saldo</p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: saldo >= 0 ? "var(--gold-soft)" : "var(--danger)" }}>{formatarValor(saldo)}</p>
        </div>
      </div>

      {/* Exportar CSV */}
      {listaFiltrada.length > 0 && (
        <button className="btn btn-secondary" style={{ marginBottom: 14, minHeight: 40 }} onClick={exportarCSV}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1={12} y1={15} x2={12} y2={3} />
          </svg>
          Exportar CSV
        </button>
      )}

      {/* Filtro por condominio */}
      {condominios.length > 0 && (
        <div className="field" style={{ marginBottom: 16 }}>
          <select value={filtroCondominio} onChange={(e) => setFiltroCondominio(e.target.value)}>
            <option value="">Todos os condominios</option>
            {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      )}

      {/* Formulario novo lancamento */}
      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold)" }}>
          <p className="card-title">Novo Lancamento</p>
          <form onSubmit={handleLancar}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button type="button"
                className={`btn ${tipo === "entrada" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, minHeight: 36 }}
                onClick={() => setTipo("entrada")}>Entrada</button>
              <button type="button"
                className={`btn ${tipo === "saida" ? "btn-danger" : "btn-secondary"}`}
                style={{ flex: 1, minHeight: 36 }}
                onClick={() => setTipo("saida")}>Saida</button>
            </div>
            <div className="field">
              <label>Valor (R$)</label>
              <input type="number" step="0.01" min="0" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
            </div>
            <div className="field">
              <label>Descricao</label>
              <input type="text" placeholder="Ex: Pagamento porteiro" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>
            <div className="field">
              <label>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaTransacao)}>
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Condominio (opcional)</label>
              <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)}>
                <option value="">Nenhum</option>
                {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="field">
              <label>Observacao (opcional)</label>
              <textarea placeholder="Detalhes adicionais..." value={obs} onChange={(e) => setObs(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Confirmar Lancamento"}
            </button>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
          </form>
        </div>
      )}

      {/* Lista de transacoes */}
      <div className="card">
        <p className="card-title">Lancamentos ({listaFiltrada.length})</p>
        {carregando ? (
          <p className="empty">Carregando...</p>
        ) : listaFiltrada.length === 0 ? (
          <p className="empty">Nenhum lancamento neste periodo.</p>
        ) : (
          listaFiltrada.map((t) => (
            <div key={t.id} className="history-item" style={{ marginBottom: 10 }}>
              <div className="history-item-left">
                <strong>{t.descricao}</strong>
                <span style={{ fontSize: "0.75rem" }}>
                  {CATEGORIAS.find((c) => c.value === t.categoria)?.label ?? t.categoria}
                  {t.condominioNome ? ` · ${t.condominioNome}` : ""}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                  {new Date(t.data + "T12:00:00").toLocaleDateString("pt-BR")} · {t.criadoPor}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontWeight: 700, color: t.tipo === "entrada" ? "var(--gold-soft)" : "var(--danger)", fontSize: "0.95rem" }}>
                  {t.tipo === "entrada" ? "+" : "-"}{formatarValor(t.valor)}
                </span>
                {perfil?.perfil === "admin" && (
                  <button
                    onClick={() => handleExcluir(t.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.7rem", padding: 0 }}>
                    excluir
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
