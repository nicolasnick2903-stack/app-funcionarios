import { useState, useEffect } from "react";
import { buscarTodosPontos, editarPonto, excluirPonto } from "@/services/ponto";
import { buscarTodosFuncionarios } from "@/services/funcionario";
import { formatarDataHora, labelTipoPonto } from "@/utils/format";
import { RegistroPonto, StatusPonto, Usuario } from "@/types";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function mesAtual() {
  const d = new Date();
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
}

function calcularHorasTotais(registros: RegistroPonto[]): number {
  const sorted = [...registros].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  let totalMs = 0;
  let entradaTime: Date | null = null;
  for (const r of sorted) {
    if (r.tipo === "entrada") {
      entradaTime = new Date(r.dataHora);
    } else if ((r.tipo === "saida" || r.tipo === "pausa") && entradaTime) {
      totalMs += new Date(r.dataHora).getTime() - entradaTime.getTime();
      entradaTime = null;
    }
  }
  return totalMs;
}

function formatarHorasMs(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h + "h " + m.toString().padStart(2, "0") + "min";
}

export default function AdminPontoScreen() {
  const [aba, setAba] = useState<"dia" | "relatorio">("dia");
  const [data, setData] = useState(hoje());
  const [pontos, setPontos] = useState<RegistroPonto[]>([]);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [filtroUid, setFiltroUid] = useState("todos");
  const [editando, setEditando] = useState<RegistroPonto | null>(null);
  const [novoTipo, setNovoTipo] = useState<StatusPonto>("entrada");
  const [novaHora, setNovaHora] = useState("");
  const [status, setStatus] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [relAno, setRelAno] = useState(mesAtual().ano);
  const [relMes, setRelMes] = useState(mesAtual().mes);
  const [relPontos, setRelPontos] = useState<RegistroPonto[]>([]);
  const [relCarregando, setRelCarregando] = useState(false);

  useEffect(() => {
    buscarTodosFuncionarios().then(setFuncionarios);
  }, []);

  useEffect(() => {
    if (aba === "dia") carregar();
  }, [data, aba]);

  useEffect(() => {
    if (aba === "relatorio") carregarRelatorio();
  }, [relAno, relMes, aba]);

  async function carregar() {
    setCarregando(true);
    const todos = await buscarTodosPontos(data, data);
    setPontos(todos);
    setCarregando(false);
  }

  async function carregarRelatorio() {
    setRelCarregando(true);
    const primeiroDia = relAno + "-" + String(relMes).padStart(2, "0") + "-01";
    const ultimoDia = new Date(relAno, relMes, 0).toISOString().slice(0, 10);
    const todos = await buscarTodosPontos(primeiroDia, ultimoDia);
    setRelPontos(todos);
    setRelCarregando(false);
  }

  function navRelMes(dir: number) {
    let nm = relMes + dir;
    let na = relAno;
    if (nm < 1) { nm = 12; na--; }
    if (nm > 12) { nm = 1; na++; }
    setRelMes(nm);
    setRelAno(na);
  }

  function nomeFunc(uid: string) {
    return funcionarios.find((f) => f.uid === uid)?.nome ?? uid.slice(0, 8) + "...";
  }

  const lista = filtroUid === "todos" ? pontos : pontos.filter((p) => p.uid === filtroUid);

  function abrirEdicao(p: RegistroPonto) {
    setEditando(p);
    setNovoTipo(p.tipo);
    setNovaHora(p.dataHora.slice(0, 16));
    setStatus("");
  }

  async function salvarEdicao() {
    if (!editando) return;
    setCarregando(true);
    try {
      await editarPonto(editando.id, novoTipo, new Date(novaHora).toISOString());
      setStatus("Ponto editado com sucesso!");
      setEditando(null);
      await carregar();
    } catch {
      setStatus("Erro ao editar.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este registro de ponto?")) return;
    setCarregando(true);
    try {
      await excluirPonto(id);
      await carregar();
    } finally {
      setCarregando(false);
    }
  }

  // Calcula relatorio por funcionario
  const relPorFunc: { uid: string; nome: string; totalMs: number; registros: number }[] = [];
  const uidsVistos = new Set<string>();
  for (const p of relPontos) {
    if (!uidsVistos.has(p.uid)) {
      uidsVistos.add(p.uid);
      const doFunc = relPontos.filter((r) => r.uid === p.uid);
      relPorFunc.push({
        uid: p.uid,
        nome: nomeFunc(p.uid),
        totalMs: calcularHorasTotais(doFunc),
        registros: doFunc.length,
      });
    }
  }
  relPorFunc.sort((a, b) => b.totalMs - a.totalMs);

  function exportarRelCSV() {
    const cab = ["Funcionario", "Total de Horas", "Registros"];
    const linhas = relPorFunc.map((r) => [r.nome, formatarHorasMs(r.totalMs), String(r.registros)]);
    const csv = [cab, ...linhas].map((row) => row.map((c) => '"' + c + '"').join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const mesNome = new Date(relAno, relMes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    a.download = "ponto_" + mesNome.replace(" ", "_") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Folha de Ponto</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={"btn " + (aba === "dia" ? "btn-primary" : "btn-secondary")}
          style={{ flex: 1, minHeight: 40 }}
          onClick={() => setAba("dia")}
        >
          Por Dia
        </button>
        <button
          className={"btn " + (aba === "relatorio" ? "btn-primary" : "btn-secondary")}
          style={{ flex: 1, minHeight: 40 }}
          onClick={() => setAba("relatorio")}
        >
          Relatorio Mensal
        </button>
      </div>

      {aba === "dia" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
              <label>Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
              <label>Funcionario</label>
              <select value={filtroUid} onChange={(e) => setFiltroUid(e.target.value)}>
                <option value="todos">Todos</option>
                {funcionarios.map((f) => (
                  <option key={f.uid} value={f.uid}>{f.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {status && <p className="status-msg success">{status}</p>}

          {editando && (
            <div className="card" style={{ borderColor: "var(--gold)", marginBottom: 16 }}>
              <p className="card-title">Editar Registro</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 10 }}>
                Funcionario: <strong>{nomeFunc(editando.uid)}</strong>
              </p>
              <div className="field">
                <label>Tipo</label>
                <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value as StatusPonto)}>
                  <option value="entrada">Entrada</option>
                  <option value="pausa">Pausa</option>
                  <option value="saida">Saida</option>
                </select>
              </div>
              <div className="field">
                <label>Data e Hora</label>
                <input type="datetime-local" value={novaHora} onChange={(e) => setNovaHora(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={salvarEdicao} disabled={carregando}>
                  Salvar
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {carregando && <p className="empty">Carregando...</p>}
          {!carregando && lista.length === 0 && <p className="empty">Nenhum registro para esta data.</p>}

          {lista.map((p) => (
            <div key={p.id} className="history-item" style={{ marginBottom: 10 }}>
              <div className="history-item-left">
                <strong>{nomeFunc(p.uid)}</strong>
                <span>{formatarDataHora(p.dataHora)}</span>
                {p.enderecoAproximado && (
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.enderecoAproximado}</span>
                )}
                {(p as RegistroPonto & { editadoEm?: string }).editadoEm && (
                  <span style={{ fontSize: "0.72rem", color: "var(--gold-soft)" }}>Editado</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <span className={"badge badge-" + p.tipo}>{labelTipoPonto(p.tipo)}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-secondary" style={{ fontSize: "0.72rem", padding: "3px 10px", minHeight: "unset" }} onClick={() => abrirEdicao(p)}>
                    Editar
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: "0.72rem", padding: "3px 10px", minHeight: "unset" }} onClick={() => handleExcluir(p.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {aba === "relatorio" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button className="btn btn-secondary" style={{ width: "auto", padding: "0 12px", minHeight: 36 }} onClick={() => navRelMes(-1)}>
              &lt;
            </button>
            <span style={{ fontWeight: 700, textTransform: "capitalize" }}>
              {new Date(relAno, relMes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <button className="btn btn-secondary" style={{ width: "auto", padding: "0 12px", minHeight: 36 }} onClick={() => navRelMes(1)}>
              &gt;
            </button>
          </div>

          {relPorFunc.length > 0 && (
            <button className="btn btn-secondary" style={{ marginBottom: 14, minHeight: 40 }} onClick={exportarRelCSV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1={12} y1={15} x2={12} y2={3} />
              </svg>
              Exportar CSV
            </button>
          )}

          {relCarregando && <p className="empty">Carregando...</p>}
          {!relCarregando && relPorFunc.length === 0 && (
            <p className="empty">Nenhum registro neste mes.</p>
          )}

          {relPorFunc.map((r) => (
            <div key={r.uid} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{r.nome}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                    {r.registros} registro{r.registros !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 900, fontSize: "1.05rem", color: "var(--gold-soft)" }}>
                    {r.totalMs > 0 ? formatarHorasMs(r.totalMs) : "0h 00min"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>horas trabalhadas</p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
