import { useState, useEffect } from "react";
import {
  buscarCondominios,
  cadastrarCondominio,
  editarCondominio,
  ativarDesativarCondominio,
} from "@/services/condominio";
import type { Condominio } from "@/types";

const CAMPOS_FORM: { label: string; key: keyof Condominio; type: string; placeholder?: string; required?: boolean }[] = [
  { label: "Nome do Condomínio", key: "nome", type: "text", placeholder: "Ed. Solar das Flores", required: true },
  { label: "Endereço", key: "endereco", type: "text", placeholder: "Rua das Flores, 123", required: true },
  { label: "Bairro", key: "bairro", type: "text", placeholder: "Centro", required: true },
  { label: "Cidade", key: "cidade", type: "text", placeholder: "São Paulo", required: true },
  { label: "Estado (UF)", key: "estado", type: "text", placeholder: "SP", required: true },
  { label: "CEP", key: "cep", type: "text", placeholder: "00000-000" },
  { label: "CNPJ", key: "cnpj", type: "text", placeholder: "00.000.000/0000-00" },
  { label: "Nome do Síndico", key: "nomeSindico", type: "text", placeholder: "Maria da Silva" },
  { label: "Telefone do Síndico", key: "telefoneSindico", type: "tel", placeholder: "(11) 99999-9999" },
  { label: "E-mail do Síndico", key: "emailSindico", type: "email", placeholder: "sindico@email.com" },
  { label: "Nº de Unidades", key: "unidades", type: "number", placeholder: "120" },
];

type FormData = Partial<Omit<Condominio, "id" | "criadoEm" | "atualizadoEm" | "ativo">>;

const formVazio: FormData = {
  nome: "", endereco: "", bairro: "", cidade: "", estado: "",
  cep: "", cnpj: "", nomeSindico: "", telefoneSindico: "", emailSindico: "", unidades: undefined,
};

export default function CondominiosScreen() {
  const [lista, setLista] = useState<Condominio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Condominio | null>(null);
  const [form, setForm] = useState<FormData>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarCondominios();
    setLista(dados);
    setCarregando(false);
  }

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setStatusMsg("");
    setMostrarForm(true);
  }

  function abrirEdicao(c: Condominio) {
    setEditando(c);
    setForm({ ...c });
    setStatusMsg("");
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setField(key: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: key === "unidades" ? Number(value) || undefined : value }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.endereco || !form.bairro || !form.cidade || !form.estado) {
      setStatusTipo("error");
      setStatusMsg("Preencha os campos obrigatórios.");
      return;
    }
    setSalvando(true);
    setStatusMsg("");
    try {
      if (editando) {
        await editarCondominio(editando.id, form);
        setLista((prev) => prev.map((c) => c.id === editando.id ? { ...c, ...form } : c));
        setStatusTipo("success");
        setStatusMsg("Condomínio atualizado!");
      } else {
        await cadastrarCondominio({ ...form as Required<FormData>, ativo: true });
        setStatusTipo("success");
        setStatusMsg("Condomínio cadastrado com sucesso!");
        await carregar();
      }
      setTimeout(() => { setMostrarForm(false); setStatusMsg(""); }, 1400);
    } catch {
      setStatusTipo("error");
      setStatusMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggle(id: string, ativo: boolean) {
    await ativarDesativarCondominio(id, !ativo);
    setLista((prev) => prev.map((c) => c.id === id ? { ...c, ativo: !ativo } : c));
  }

  const filtrados = lista.filter((c) =>
    busca === "" ||
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    (c.nomeSindico ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Condomínios</h1>

      {mostrarForm ? (
        <div className="card admin-edit-card">
          <p className="card-title">{editando ? `Editar: ${editando.nome}` : "Novo Condomínio"}</p>
          <form onSubmit={handleSalvar}>
            {CAMPOS_FORM.map(({ label, key, type, placeholder, required }) => (
              <div key={key} className="field">
                <label>{label}{required && " *"}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form[key as keyof FormData] as string | number | undefined) ?? ""}
                  onChange={(e) => setField(key as keyof FormData, e.target.value)}
                  required={required}
                />
              </div>
            ))}
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
            <div className="admin-save-row">
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="admin-actions">
            <button type="button" className="btn btn-primary" onClick={abrirNovo}>
              + Novo Condomínio
            </button>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Buscar por nome, cidade ou síndico..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {carregando && <p className="empty">Carregando...</p>}
          {!carregando && filtrados.length === 0 && <p className="empty">Nenhum condomínio cadastrado.</p>}

          {filtrados.map((c) => (
            <div key={c.id} className="card card-spaced">
              <div className="admin-row">
                <div className="admin-row-info">
                  <p className="name">{c.nome}</p>
                  <p className="sub">{c.endereco}, {c.bairro}</p>
                  <p className="sub">{c.cidade} — {c.estado}{c.cep ? ` · CEP ${c.cep}` : ""}</p>
                  {c.nomeSindico && <p className="tiny">Síndico: {c.nomeSindico}</p>}
                  {c.telefoneSindico && <p className="tiny">Tel: {c.telefoneSindico}</p>}
                  {c.emailSindico && <p className="tiny">{c.emailSindico}</p>}
                  {c.cnpj && <p className="tiny">CNPJ: {c.cnpj}</p>}
                  {c.unidades && <p className="tiny">{c.unidades} unidades</p>}
                  <div className="admin-badges" style={{ marginTop: 6 }}>
                    <span className={`badge badge-${c.ativo ? "aprovado" : "rejeitado"}`}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => abrirEdicao(c)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={`btn ${c.ativo ? "btn-danger" : "btn-primary"}`}
                    onClick={() => handleToggle(c.id, c.ativo)}
                  >
                    {c.ativo ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
