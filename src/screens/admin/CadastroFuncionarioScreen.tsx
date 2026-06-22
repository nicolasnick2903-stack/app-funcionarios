import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarFuncionario } from "@/services/funcionario";
import type { Perfil } from "@/types";

export default function CadastroFuncionarioScreen() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("funcionario");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");
  const [matricula, setMatricula] = useState("");
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      setStatusTipo("error");
      setStatus("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    setStatus("Cadastrando funcionário...");
    setStatusTipo("");
    try {
      await cadastrarFuncionario({ nome, email, senha, perfil, cargo, setor, matricula });
      setStatusTipo("success");
      setStatus("Funcionário cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setPerfil("funcionario");
      setCargo("");
      setSetor("");
      setMatricula("");
      setTimeout(() => navigate("/admin/funcionarios"), 1500);
    } catch (err: unknown) {
      setStatusTipo("error");
      if (err instanceof Error && err.message.includes("email-already-in-use")) {
        setStatus("Este e-mail já está cadastrado.");
      } else {
        setStatus("Erro ao cadastrar. Verifique os dados e tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="screen">
      <button
        onClick={() => navigate("/admin/funcionarios")}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          cursor: "pointer",
          marginBottom: 12,
          padding: 0,
        }}
      >
        ← Voltar
      </button>

      <p className="eyebrow">Painel Admin</p>
      <h1 className="screen-title">Novo Funcionário</h1>

      <div className="card">
        <form onSubmit={handleCadastrar}>
          <div className="field">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>E-mail (usado para login)</label>
            <input
              type="email"
              placeholder="joao@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Senha inicial</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Perfil de acesso</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}>
              <option value="funcionario">Funcionário</option>
              <option value="gestor">Gestor</option>
              <option value="rh">RH</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="field">
            <label>Cargo</label>
            <input
              type="text"
              placeholder="Auxiliar de Limpeza"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Setor</label>
            <input
              type="text"
              placeholder="Facilities"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Matrícula</label>
            <input
              type="text"
              placeholder="MH-0001"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Cadastrar Funcionário"}
          </button>
          {status && <p className={`status-msg ${statusTipo}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
