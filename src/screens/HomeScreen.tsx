import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatarData } from "@/utils/format";

export default function HomeScreen() {
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const hoje = formatarData(new Date().toISOString());

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
      <div className="home-header">
        <p className="eyebrow">{hoje}</p>
        <h1>Olá, {perfil?.nome?.split(" ")[0] ?? "Funcionário"} 👋</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
          {perfil?.cargo ?? ""} {perfil?.setor ? `· ${perfil.setor}` : ""}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="card-title">Matrícula</p>
        <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--gold-soft)" }}>
          {perfil?.matricula ?? "---"}
        </p>
      </div>

      <p className="card-title" style={{ marginBottom: 12 }}>Acesso Rápido</p>
      <div className="quick-grid">
        {atalhos.map((a) => (
          <button key={a.path} className="quick-card" onClick={() => navigate(a.path)}>
            {a.icon}
            <span>{a.label}</span>
            <small>{a.desc}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
