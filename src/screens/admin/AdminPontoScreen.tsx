import { useState, useEffect } from "react";
import { buscarTodosPontos, editarPonto, excluirPonto } from "@/services/ponto";
import { buscarTodosFuncionarios } from "@/services/funcionario";
import { formatarDataHora, labelTipoPonto } from "@/utils/format";
import { RegistroPonto, StatusPonto, Usuario } from "@/types";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPontoScreen() {
  const [data, setData] = useState(hoje());
  const [pontos, setPontos] = useState<RegistroPonto[]>([]);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [filtroUid, setFiltroUid] = useState("todos");
  const [editando, setEditando] = useState<RegistroPonto | null>(null);
  const [novoTipo, setNovoTipo] = useState<StatusPonto>("entrada");
  const [novaHora, setNovaHora] = useState("");
  const [status, setStatus] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    buscarTodosFuncionarios().then(setFuncionarios);
  }, []);

  useEffect(() => {
    carregar();
  }, [data]);

  async function carregar() {
    setCarregando(true);
    const todos = await buscarTodosPontos(data, data);
    setPontos(todos);
    setCarregando(false);
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

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Folha de Ponto</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
          <label>Funcionário</label>
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
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 10 }}>
            Funcionário: <strong>{nomeFunc(editando.uid)}</strong>
          </p>
          <div className="field">
            <label>Tipo</label>
            <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value as StatusPonto)}>
              <option value="entrada">Entrada</option>
              <option value="pausa">Pausa</option>
              <option value="saida">Saída</option>
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

      {!carregando && lista.length === 0 && (
        <p className="empty">Nenhum registro para esta data.</p>
      )}

      {lista.map((p) => (
        <div key={p.id} className="history-item" style={{ marginBottom: 10 }}>
          <div className="history-item-left">
            <strong>{nomeFunc(p.uid)}</strong>
            <span>{formatarDataHora(p.dataHora)}</span>
            {p.enderecoAproximado && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.enderecoAproximado}</span>
            )}
            {(p as RegistroPonto & { editadoEm?: string }).editadoEm && (
              <span style={{ fontSize: "0.72rem", color: "var(--gold-soft)" }}>✎ Editado</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <span className={`badge badge-${p.tipo}`}>{labelTipoPonto(p.tipo)}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.72rem", padding: "3px 10px", minHeight: "unset" }}
                onClick={() => abrirEdicao(p)}
              >
                Editar
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: "0.72rem", padding: "3px 10px", minHeight: "unset" }}
                onClick={() => handleExcluir(p.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
