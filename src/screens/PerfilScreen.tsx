import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { recuperarSenha } from "@/services/auth";
import { formatarData } from "@/utils/format";

const labelPerfil: Record<string, string> = {
  funcionario: "Funcionario",
  gestor: "Gestor",
  rh: "RH",
  admin: "Administrador",
};

export default function PerfilScreen() {
  const { user, perfil } = useAuth();
  const [enviandoSenha, setEnviandoSenha] = useState(false);
  const [msgSenha, setMsgSenha] = useState("");
  const [msgTipo, setMsgTipo] = useState<"" | "success" | "error">("");

  async function handleRecuperarSenha() {
    if (!user?.email) return;
    if (!confirm("Enviar e-mail de redefinicao de senha para " + user.email + "?")) return;
    setEnviandoSenha(true);
    setMsgSenha("");
    try {
      await recuperarSenha(user.email);
      setMsgTipo("success");
      setMsgSenha("E-mail de redefinicao enviado! Verifique sua caixa de entrada.");
    } catch {
      setMsgTipo("error");
      setMsgSenha("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setEnviandoSenha(false);
    }
  }

  const campos = [
    { label: "Nome", value: perfil?.nome },
    { label: "E-mail", value: user?.email },
    { label: "Matricula", value: perfil?.matricula },
    { label: "Cargo", value: perfil?.cargo },
    { label: "Setor", value: perfil?.setor },
    { label: "Perfil de acesso", value: labelPerfil[perfil?.perfil ?? ""] ?? perfil?.perfil },
  ];

  return (
    <div className="screen">
      <p className="eyebrow">Minha Conta</p>
      <h1 className="screen-title">Perfil</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--gold-soft))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", fontWeight: 900, color: "#171103", flexShrink: 0
          }}>
            {perfil?.nome?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: "1rem" }}>{perfil?.nome ?? "---"}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{user?.email}</p>
            <span className={"badge badge-pendente"} style={{ marginTop: 6, display: "inline-flex" }}>
              {labelPerfil[perfil?.perfil ?? ""] ?? perfil?.perfil ?? "---"}
            </span>
          </div>
        </div>

        {campos.map((c) => (
          <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700 }}>{c.label}</span>
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{c.value ?? "---"}</span>
          </div>
        ))}

        {perfil?.criadoEm && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700 }}>Membro desde</span>
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{formatarData(perfil.criadoEm)}</span>
          </div>
        )}
      </div>

      <div className="card">
        <p className="card-title">Seguranca</p>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 14 }}>
          Um link de redefinicao sera enviado para o seu e-mail cadastrado.
        </p>
        <button
          className="btn btn-secondary"
          onClick={handleRecuperarSenha}
          disabled={enviandoSenha}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          {enviandoSenha ? "Enviando..." : "Redefinir Senha"}
        </button>
        {msgSenha && <p className={"status-msg " + msgTipo} style={{ marginTop: 10 }}>{msgSenha}</p>}
      </div>
    </div>
  );
}
