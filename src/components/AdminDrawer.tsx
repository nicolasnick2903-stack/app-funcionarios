import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

type MenuItem = { label: string; desc: string; path: string; icon: React.ReactNode };
type MenuGroup = { group: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    group: "Operacional",
    items: [
      {
        label: "Ordem de Serviço",
        desc: "Formalizar trabalhos realizados",
        path: "/admin/os",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={8} y1={13} x2={16} y2={13}/><line x1={8} y1={17} x2={16} y2={17}/></svg>,
      },
      {
        label: "Checklist de Supervisão",
        desc: "Vistoria diária e semanal",
        path: "/admin/checklist",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
      },
      {
        label: "Relatório Mensal",
        desc: "Comprovante de serviços ao cliente",
        path: "/admin/relatorio",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><line x1={18} y1={20} x2={18} y2={10}/><line x1={12} y1={20} x2={12} y2={4}/><line x1={6} y1={20} x2={6} y2={14}/></svg>,
      },
      {
        label: "Ficha de Ocorrência",
        desc: "Incidentes e irregularidades",
        path: "/admin/ocorrencia",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>,
      },
    ],
  },
  {
    group: "RH / Funcionários",
    items: [
      {
        label: "Cadastro de Funcionários",
        desc: "Adicionar novo colaborador",
        path: "/admin/funcionarios/novo",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx={9} cy={7} r={4}/><line x1={19} y1={8} x2={19} y2={14}/><line x1={22} y1={11} x2={16} y2={11}/></svg>,
      },
      {
        label: "Avaliação de Desempenho",
        desc: "Notas periódicas por critérios",
        path: "/admin/avaliacao",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      },
      {
        label: "Escala de Trabalho",
        desc: "Turnos e horários por posto",
        path: "/admin/escala",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,
      },
      {
        label: "Ferias",
        desc: "Aprovar solicitacoes de ferias",
        path: "/admin/ferias",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
      {
        label: "Atestados",
        desc: "Aprovar e gerenciar atestados",
        path: "/admin/atestados",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={12} y1={18} x2={12} y2={12}/><line x1={9} y1={15} x2={15} y2={15}/></svg>,
      },
    ],
  },
  {
    group: "Financeiro",
    items: [
      {
        label: "Financeiro",
        desc: "Fluxo de caixa e lançamentos",
        path: "/admin/financeiro",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
      },
      {
        label: "Recibo de Serviços",
        desc: "Emitir recibos para clientes",
        path: "/admin/recibo",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={8} y1={13} x2={16} y2={13}/><line x1={8} y1={17} x2={11} y2={17}/></svg>,
      },
    ],
  },
  {
    group: "Clientes",
    items: [
      {
        label: "Cadastro de Condomínio",
        desc: "Gerenciar condomínios",
        path: "/admin/condominios",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
      {
        label: "Pesquisa de Satisfação",
        desc: "Avaliar satisfação do cliente",
        path: "/admin/pesquisa",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
      },
      {
        label: "Cadastro de Fornecedor",
        desc: "Empresas e prestadores",
        path: "/admin/fornecedores",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x={8} y={12} width={8} height={10}/></svg>,
      },
    ],
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
          {menuGroups.map((group) => (
            <div key={group.group}>
              <p className="drawer-group-label">{group.group}</p>
              {group.items.map((item) => (
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16} className="drawer-chevron">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
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
