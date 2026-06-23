import { useState, useEffect } from "react";
import {
  buscarFornecedores,
  cadastrarFornecedor,
  editarFornecedor,
  ativarDesativarFornecedor,
} from "@/services/fornecedor";
import type { Fornecedor, CategoriaFornecedor } from "@/types";

const CATEGORIAS: CategoriaFornecedor[] = [
  "limpeza", "segurança", "manutenção", "jardinagem",
  "portaria", "elétrica", "hidráulica", "pintura", "outro",
];

type FormData = Partial<Omit<Fornecedor, "id" | "criadoEm" | "atualizadoEm" | "ativo">>;

const formVazio: FormData = {
  nome: "", categoria: "outro", cnpj: "", nomeContato: "",
  telefone: "", email: "", endereco: "", cidade: "", estado: "", observacao: "",
};

export default function FornecedoresScreen() {
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FormData>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "success" | "error">("");
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarFornecedores();
    setLista(dados);
    setCarregando(false);
  }

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setStatusMsg("");
    setMostrarForm(true);
  }

  function abrirEdicao(f: Fornecedor) {
    setEditando(f);
    setForm({ ...f });
    setStatusMsg("");
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.categoria) {
      setStatusTipo("error");
      setStatusMsg("Preencha nome e categoria.");
      return;
    }
    setSalvando(true);
    setStatusMsg("");
    try {
      if (editando) {
        await editarFornecedor(editando.id, form);
        setLista((prev) => prev.map((f) => f.id === editando.id ? { ...f, ...form } as Fornecedor : f));
        setStatusTipo("success");
        setStatusMsg("Fornecedor atualizado!");
      } else {
        await cadastrarFornecedor({ ...form as Required<FormData>, ativo: true });
        setStatusTipo("success");
        setStatusMsg("Fornecedor cadastrado com sucesso!");
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
    await ativarDesativarFornecedor(id, !ativo);
    setLista((prev) => prev.map((f) => f.id === id ? { ...f, ativo: !ativo } : f));
  }

  const filtrados = lista.filter((f) =>
    busca === "" ||
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.categoria.toLowerCase().includes(busca.toLowerCase()) ||
    (f.cidade ?? "").toLowerCase().includes(busca.toLowerCase()) ||
    (f.nomeContato ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Fornecedores</h1>

      {mostrarForm ? (
        <div className="card admin-edit-card">
          <p className="card-title">{editando ? `Editar: ${editando.nome}` : "Novo Fornecedor"}</p>
          <form onSubmit={handleSalvar}>
            <div className="field">
              <label>Nome da Empresa *</label>
              <input
                type="text"
                placeholder="Ex: Limpeza Total Ltda"
                value={form.nome ?? ""}
                onChange={(e) => setField("nome", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Categoria *</label>
              <select
                value={form.categoria ?? "outro"}
                onChange={(e) => setField("categoria", e.target.value)}
                required
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={form.cnpj ?? ""}
                onChange={(e) => setField("cnpj", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Nome do Contato</label>
              <input
                type="text"
                placeholder="João Silva"
                value={form.nomeContato ?? ""}
                onChange={(e) => setField("nomeContato", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.telefone ?? ""}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="contato@empresa.com"
                value={form.email ?? ""}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Endereço</label>
              <input
                type="text"
                placeholder="Rua das Flores, 123"
                value={form.endereco ?? ""}
                onChange={(e) => setField("endereco", e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Cidade</label>
                <input
                  type="text"
                  placeholder="São Paulo"
                  value={form.cidade ?? ""}
                  onChange={(e) => setField("cidade", e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0, width: 70 }}>
                <label>UF</label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={form.estado ?? ""}
                  onChange={(e) => setField("estado", e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Observações</label>
              <textarea
                placeholder="Informações adicionais..."
                value={form.observacao ?? ""}
                onChange={(e) => setField("observacao", e.target.value)}
                rows={3}
              />
            </div>
            {statusMsg && <p className={`status-msg ${statusTipo}`}>{statusMsg}</p>}
            <div className="admin-save-row" style={{ marginTop: 8 }}>
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
              + Novo Fornecedor
            </button>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Buscar por nome, categoria, cidade ou contato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {carregando && <p className="empty">Carregando...</p>}
          {!carregando && filtrados.length === 0 && <p className="empty">Nenhum fornecedor cadastrado.</p>}

          {filtrados.map((f) => (
            <div key={f.id} className="card card-spaced">
              <div className="admin-row">
                <div className="admin-row-info">
                  <p className="name">{f.nome}</p>
                  <p className="sub" style={{ textTransform: "capitalize" }}>{f.categoria}</p>
                  {f.nomeContato && <p className="tiny">Contato: {f.nomeContato}</p>}
                  {f.telefone && <p className="tiny">Tel: {f.telefone}</p>}
                  {f.email && <p className="tiny">{f.email}</p>}
                  {f.cnpj && <p className="tiny">CNPJ: {f.cnpj}</p>}
                  {(f.cidade || f.estado) && (
                    <p className="tiny">{[f.cidade, f.estado].filter(Boolean).join(" — ")}</p>
                  )}
                  <div className="admin-badges" style={{ marginTop: 6 }}>
                    <span className={`badge badge-${f.ativo ? "aprovado" : "rejeitado"}`}>
                      {f.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => abrirEdicao(f)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={`btn ${f.ativo ? "btn-danger" : "btn-primary"}`}
                    onClick={() => handleToggle(f.id, f.ativo)}
                  >
                    {f.ativo ? "Desativar" : "Ativar"}
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
