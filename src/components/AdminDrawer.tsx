import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: "Financeiro",
    desc: "Fluxo de caixa e lancamentos",
    path: "/admin/financeiro",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <line x1={12} y1={1} x2={12} y2={23} />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: "Atestados",
    desc: "Aprovar e gerenciar atestados",
    path: "/admin/atestados",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1={12} y1={18} x2={12} y2={12} />
        <line x1={9} y1={15} x2={15} y2={15} />
      </svg>
    ),
  },
  {
    label: "Ferias",
    desc: "Aprovar solicitacoes de ferias",
    path: "/admin/ferias",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <rect x={3} y={4} width={18} height={18} rx={2} />
        <line x1={16} y1={2} x2={16} y2={6} />
        <line x1={8} y1={2} x2={8} y2={6} />
        <line x1={3} y1={10} x2={21} y2={10} />
      </svg>
    ),
  },
  {
    label: "Cadastro de Funcionarios",
    desc: "Adicionar novo colaborador",
    path: "/admin/funcionarios/novo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx={9} cy={7} r={4} />
        <line x1={19} y1={8} x2={19} y2={14} />
        <line x1={22} y1={11} x2={16} y2={11} />
      </svg>
    ),
  },
  {
    label: "Cadastro de Condominio",
    desc: "Gerenciar condominios",
    path: "/admin/condominios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Cadastro de Fornecedor",
    desc: "Empresas e prestadores",
    path: "/admin/fornecedores",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <rect x={8} y={12} width={8} height={10} />
      </svg>
    ),
  },
];

export default function AdminDrawer({ open, onClose }: Props) {
  const navigate = useNavigate();

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <>
      <div
        className={"drawer-overlay " + (open ? "drawer-overlay-visible" : "")}
        onClick={onClose}
      />
      <div className={"drawer " + (open ? "drawer-open" : "")}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow" style={{ marginBottom: 2 }}>Admin</p>
            <p style={{ fontWeight: 900, fontSize: "1rem" }}>Menu de Cadastros</p>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={20} height={20}>
              <line x1={18} y1={6} x2={6} y2={18} />
              <line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        <nav className="drawer-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className="drawer-item"
              onClick={() => go(item.path)}
            >
              <span className="drawer-item-icon">{item.icon}</span>
              <span className="drawer-item-text">
                <span className="drawer-item-label">{item.label}</span>
                <span className="drawer-item-desc">{item.desc}</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16} style={{ flexShrink: 0, opacity: 0.4 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </nav>

        <div className="drawer-footer">
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center" }}>
            MH Facilities
          </p>
        </div>
      </div>
    </>
  );
}
