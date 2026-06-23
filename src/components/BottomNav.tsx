import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { buscarTodasFerias } from "@/services/ferias";
import { buscarTodosAtestados } from "@/services/atestado";

const itemsFuncionario = [
  { path: "/home", label: "Home", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>) },
  { path: "/ponto", label: "Ponto", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>) },
  { path: "/ferias", label: "Ferias", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /><line x1={3} y1={10} x2={21} y2={10} /></svg>) },
  { path: "/atestado", label: "Atestado", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1={12} y1={18} x2={12} y2={12} /><line x1={9} y1={15} x2={15} y2={15} /></svg>) },
  { path: "/perfil", label: "Perfil", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>) },
];

const itemsAdmin = [
  { path: "/home", label: "Home", badgeKey: "", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>) },
  { path: "/admin/ponto", label: "Ponto", badgeKey: "", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>) },
  { path: "/admin/ferias", label: "Ferias", badgeKey: "ferias", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /><line x1={3} y1={10} x2={21} y2={10} /></svg>) },
  { path: "/admin/atestados", label: "Atestados", badgeKey: "atestados", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1={12} y1={18} x2={12} y2={12} /><line x1={9} y1={15} x2={15} y2={15} /></svg>) },
  { path: "/admin/financeiro", label: "Caixa", badgeKey: "", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>) },
  { path: "/admin/funcionarios", label: "Equipe", badgeKey: "", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={22} height={22}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>) },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { perfil } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({ ferias: 0, atestados: 0 });
  const isAdmin = perfil?.perfil === "admin" || perfil?.perfil === "gestor";

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      buscarTodasFerias(),
      buscarTodosAtestados(),
    ]).then(([ferias, atestados]) => {
      setBadges({
        ferias: ferias.filter((f) => f.status === "pendente").length,
        atestados: atestados.filter((a) => a.status === "pendente").length,
      });
    });
  }, [isAdmin, pathname]);

  const items = isAdmin ? itemsAdmin : itemsFuncionario;

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const bk = (item as { badgeKey?: string }).badgeKey;
        const count = bk ? (badges[bk] ?? 0) : 0;
        return (
          <button key={item.path} type="button"
            className={"nav-item " + (pathname.startsWith(item.path) ? "active" : "")}
            onClick={() => navigate(item.path)}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              {item.icon}
              {count > 0 && (
                <span style={{ position: "absolute", top: -4, right: -6, background: "#e53e3e", color: "#fff", borderRadius: "50%", fontSize: "0.6rem", fontWeight: 700, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
