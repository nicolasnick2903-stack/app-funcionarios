import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  buscarTodosFuncionarios,
  ativarDesativarFuncionario,
  editarFuncionario,
} from "@/services/funcionario";
import type { Perfil, Usuario } from "@/types";

const labelPerfil: Record<string, string> = {
  funcionario: "Funcionário",
  gestor: "Gestor",
  rh: "RH",
  admin: "Administrador",
};

function exportarCSV(lista: Usuario[]) {
  const cab = ["Nome", "Email", "CPF", "Data Nasc.", "Matrícula", "Cargo", "Setor", "Perfil", "Ativo", "Criado em"];
  const linhas = lista.map((f) => [
    f.nome, f.email, f.cpf ?? "", f.dataNascimento ?? "", f.matricula,
    f.cargo, f.setor, labelPerfil[f.perfil] ?? f.perfil,
    f.ativo ? "Sim" : "Não", f.criadoEm.slice(0, 10),
  ]);
  const csv = [cab, ...linhas].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "funcionarios.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const CAMPOS: { label: string; key: keyof Usuario; type: string; placeholder?: string }[] = [
  { label: "Nome", key: "nome", type: "text" },
  { label: "E-mail", key: "email", type: "email" },
  { label: "CPF", key: "cpf", type: "text", placeholder: "000.000.000-00" },
  { label: "Data de Nascimento", key: "dataNascimento", type: "date" },
  { label: "Matrícula", key: "matricula", type: "text" },
  { label: "Cargo", key: "cargo", type: "text" },
  { label: "Setor", key: "setor", type: "text" },
];

export default function FuncionariosScreen() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [salvando, setSalvando] = useState(false);
  const [statusEdicao, setStatusEdicao] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    buscarTodosFuncionarios()
      .then(setLista)
      .catch(() => setErro("Erro ao carregar funcionários."))
      .finally(() => setCarregando(false));
  }

  async function handleToggleAtivo(uid: string, ativo: boolean) {
    await ativarDesativarFuncionario(uid, !ativo);
    setLista((prev) => prev.map((f) => (f.uid === uid ? { ...f, ativo: !ativo } : f)));
  }

  function abrirEdicao(f: Usuario) {
    setEditando(f);
    setForm({ ...f });
    setStatusEdicao("");
  }

  async function salvarEdicao() {
    if (!editando) return;
    setSalvando(true);
    setStatusEdicao("");
    try {
      await editarFuncionario(editando.uid, form);
      setLista((prev) => prev.map((f) => (f.uid === editando.uid ? { ...f, ...form } : f)));
      setStatusEdicao("Salvo com sucesso!");
      setTimeout(() => { setEditando(null); setStatusEdicao(""); }, 1200);
    } catch {
      setStatusEdicao("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = lista.filter((f) =>
    busca === "" ||
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.email.toLowerCase().includes(busca.toLowerCase()) ||
    (f.matricula ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Funcionários</h1>

      <div className="admin-actions">
        <button type="button" className="btn btn-primary" onClick={() => navigate("/admin/funcionarios/novo")}>
          + Novo Funcionário
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => exportarCSV(lista)}>
          Exportar CSV
        </button>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou matrícula..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {carregando && <p className="empty">Carregando...</p>}
      {erro && <p className="status-msg error">{erro}</p>}
      {!carregando && filtrados.length === 0 && <p className="empty">Nenhum funcionário encontrado.</p>}

      {editando && (
        <div className="card admin-edit-card">
          <p className="card-title">Editar: {editando.nome}</p>
          <div className="admin-edit-grid">
            {CAMPOS.map(({ label, key, type, placeholder }) => (
              <div key={key} className="field">
                <label>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form[key] as string) ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="field">
              <label htmlFor="edit-perfil">Perfil de Acesso</label>
              <select
                id="edit-perfil"
                title="Perfil de acesso do funcionário"
                value={form.perfil ?? "funcionario"}
                onChange={(e) => setForm((prev) => ({ ...prev, perfil: e.target.value as Perfil }))}
              >
                <option value="funcionario">Funcionário</option>
                <option value="gestor">Gestor</option>
                <option value="rh">RH</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {statusEdicao && (
            <p className={`status-msg ${statusEdicao.includes("Erro") ? "error" : "success"}`}>{statusEdicao}</p>
          )}
          <div className="admin-save-row">
            <button type="button" className="btn btn-primary" onClick={salvarEdicao} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditando(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {filtrados.map((f) => (
        <div key={f.uid} className="card card-spaced">
          <div className="admin-row">
            <div className="admin-row-info">
              <p className="name">{f.nome}</p>
              <p className="sub">{f.email}</p>
              <p className="sub">{f.cargo} · {f.setor}</p>
              {f.cpf && <p className="tiny">CPF: {f.cpf}</p>}
              {f.dataNascimento && <p className="tiny">Nasc.: {f.dataNascimento}</p>}
              <div className="admin-badges">
                <span className={`badge badge-${f.ativo ? "aprovado" : "rejeitado"}`}>
                  {f.ativo ? "Ativo" : "Inativo"}
                </span>
                <span className="badge badge-pendente">{labelPerfil[f.perfil] ?? f.perfil}</span>
                <span className="admin-badge-muted">#{f.matricula}</span>
              </div>
            </div>
            <div className="admin-row-actions">
              <button type="button" className="btn btn-secondary" onClick={() => abrirEdicao(f)}>
                Editar
              </button>
              <button
                type="button"
                className={`btn ${f.ativo ? "btn-danger" : "btn-primary"}`}
                onClick={() => handleToggleAtivo(f.uid, f.ativo)}
              >
                {f.ativo ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
