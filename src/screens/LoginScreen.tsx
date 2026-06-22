import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, recuperarSenha } from "@/services/auth";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      setStatusTipo("error");
      setStatus("Informe e-mail e senha.");
      return;
    }
    setCarregando(true);
    setStatus("Entrando...");
    setStatusTipo("");
    try {
      await login(email, senha);
      navigate("/home");
    } catch {
      setStatusTipo("error");
      setStatus("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleRecuperar() {
    if (!email) {
      setStatusTipo("error");
      setStatus("Informe seu e-mail para recuperar a senha.");
      return;
    }
    try {
      await recuperarSenha(email);
      setStatusTipo("success");
      setStatus("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
    } catch {
      setStatusTipo("error");
      setStatus("Não foi possível enviar o e-mail. Verifique o endereço informado.");
    }
  }

  return (
    <div className="login-screen">
      <div className="login-logo-wrap">
        <img src="/logo.png" alt="MH Facilities & Segurança" className="login-logo" />
      </div>
      <h1 className="login-title">MH Funcionário</h1>
      <p className="login-sub">Portal exclusivo da equipe MH Facilities &amp; Segurança</p>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p className={`status-msg ${statusTipo}`}>{status}</p>

        <div className="login-links">
          <a onClick={handleRecuperar} style={{ cursor: "pointer" }}>
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  );
}
