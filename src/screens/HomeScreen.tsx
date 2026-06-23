import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth";
import { formatarData } from "@/utils/format";

export default function HomeScreen() {
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const hoje = formatarData(new Date().toISOString());

  async function handleSair() {
    if (!confirm("Deseja sair do aplicativo?")) return;
    await logout();
    navigate("/", { replace: true });
  }

  const atalhos = [
    {
      label: "Registrar Ponto",
      desc: "Entrada / Saída",
      path: "/ponto",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
          <circle cx={12} cy={12} r={10} />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      label: "Solicitar Férias",
      desc: "Nova solicitação",
      path: "/ferias",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
          <rect x={3} y={4} width={18} height={18} rx={2} />
          <line x1={16} y1={2} x2={16} y2={6} />
          <line x1={8} y1={2} x2={8} y2={6} />
          <line x1={3} y1={10} x2={21} y2={10} />
        </svg>
      )
    },
    {
      label: "Enviar Atestado",
      desc: "Upload de documento",
      path: "/atestado",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1={12} y1={18} x2={12} y2={12} />
          <line x1={9} y1={15} x2={15} y2={15} />
        </svg>
      )
    },
    {
      label: "Avisos",
      desc: "Comunicados da equipe",
      path: "/feed",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      )
    }
  ];

  return (
    <div className="screen">
      <div className="home-topbar">
        <div>
          <p className="eyebrow">{hoje}</p>
          <h1>Olá, {perfil?.nome?.split(" ")[0] ?? "Funcionário"} 👋</h1>
          <p className="home-cargo">
            {perfil?.cargo ?? ""} {perfil?.setor ? `· ${perfil.setor}` : ""}
          </p>
        </div>
        <button type="button" className="btn-sair" onClick={handleSair} title="Sair">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={20} height={20}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1={21} y1={12} x2={9} y2={12} />
          </svg>
          Sair
        </button>
      </div>

      <div className="card card-mb20">
        <p className="card-title">Matrícula</p>
        <p className="matricula-value">{perfil?.matricula ?? "---"}</p>
      </div>

      <p className="card-title" style={{ marginBottom: 12 }}>Acesso Rápido</p>
      <div className="quick-grid">
        {(perfil?.perfil === "admin" || perfil?.perfil === "gestor") && (
          <button type="button" className="quick-card" onClick={() => navigate("/admin/condominios")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Condomínios</span>
            <small>Cadastrar e gerenciar</small>
          </button>
        )}
      </div>
      <p className="card-title" style={{ marginBottom: 12, marginTop: 8 }}>Ações</p>
      <div className="quick-grid">
        {atalhos.map((a) => (
          <button key={a.path} type="button" className="quick-card" onClick={() => navigate(a.path)}>
            {a.icon}
            <span>{a.label}</span>
            <small>{a.desc}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
