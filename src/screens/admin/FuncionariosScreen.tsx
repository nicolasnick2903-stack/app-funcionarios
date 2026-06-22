import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  buscarTodosFuncionarios,
  ativarDesativarFuncionario,
} from "@/services/funcionario";
import type { Usuario } from "@/types";

const labelPerfil: Record<string, string> = {
  funcionario: "Funcionário",
  gestor: "Gestor",
  rh: "RH",
  admin: "Administrador",
};

export default function FuncionariosScreen() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarTodosFuncionarios()
      .then(setLista)
      .catch(() => setErro("Erro ao carregar funcionários."))
      .finally(() => setCarregando(false));
  }, []);

  async function handleToggleAtivo(uid: string, ativo: boolean) {
    await ativarDesativarFuncionario(uid, !ativo);
    setLista((prev) =>
      prev.map((f) => (f.uid === uid ? { ...f, ativo: !ativo } : f))
    );
  }

  return (
    <div className="screen">
      <p className="eyebrow">Painel Admin</p>
      <h1 className="screen-title">Funcionários</h1>

      <button
        className="btn btn-primary"
        style={{ marginBottom: 20 }}
        onClick={() => navigate("/admin/funcionarios/novo")}
      >
        + Novo Funcionário
      </button>

      {carregando && <p className="empty">Carregando...</p>}
      {erro && <p className="status-msg error">{erro}</p>}

      {!carregando && lista.length === 0 && (
        <p className="empty">Nenhum funcionário cadastrado ainda.</p>
      )}

      {lista.map((f) => (
        <div key={f.uid} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{f.nome}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 2 }}>{f.email}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 4 }}>
                {f.cargo} · {f.setor}
              </p>
              <span
                className={`badge badge-${f.ativo ? "aprovado" : "rejeitado"}`}
                style={{ marginRight: 6 }}
              >
                {f.ativo ? "Ativo" : "Inativo"}
              </span>
              <span className="badge badge-pendente">{labelPerfil[f.perfil] ?? f.perfil}</span>
            </div>
            <button
              className={`btn ${f.ativo ? "btn-danger" : "btn-primary"}`}
              style={{ fontSize: "0.78rem", padding: "6px 12px", minWidth: 80 }}
              onClick={() => handleToggleAtivo(f.uid, f.ativo)}
            >
              {f.ativo ? "Desativar" : "Ativar"}
            </button>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>
            Matrícula: {f.matricula}
          </p>
        </div>
      ))}
    </div>
  );
}
