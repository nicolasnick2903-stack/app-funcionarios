import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { buscarAvisos, publicarAviso } from "@/services/feed";
import { formatarData, labelTipoAviso } from "@/utils/format";
import { Aviso, TipoAviso } from "@/types";

export default function FeedScreen() {
  const { perfil } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<TipoAviso>("geral");
  const [fixado, setFixado] = useState(false);
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const podePublicar = perfil?.perfil === "gestor" || perfil?.perfil === "rh" || perfil?.perfil === "admin";

  useEffect(() => {
    buscarAvisos().then(setAvisos);
  }, []);

  async function handlePublicar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !titulo || !conteudo) {
      setStatusTipo("error");
      setStatus("Preencha título e conteúdo.");
      return;
    }
    setCarregando(true);
    setStatus("Publicando aviso...");
    setStatusTipo("");
    try {
      await publicarAviso(titulo, conteudo, tipo, perfil.nome, fixado);
      setStatusTipo("success");
      setStatus("Aviso publicado com sucesso!");
      setTitulo("");
      setConteudo("");
      setFixado(false);
      setMostrarForm(false);
      const novos = await buscarAvisos();
      setAvisos(novos);
    } catch {
      setStatusTipo("error");
      setStatus("Erro ao publicar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Comunicados</p>
          <h1 className="screen-title" style={{ marginBottom: 0 }}>Avisos</h1>
        </div>
        {podePublicar && (
          <button
            className="btn btn-primary"
            style={{ width: "auto", padding: "0 16px", minHeight: 40, fontSize: "0.85rem" }}
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Cancelar" : "+ Novo Aviso"}
          </button>
        )}
      </div>

      {mostrarForm && podePublicar && (
        <div className="card">
          <p className="card-title">Publicar Aviso</p>
          <form onSubmit={handlePublicar}>
            <div className="field">
              <label>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAviso)}>
                <option value="geral">Geral</option>
                <option value="urgente">Urgente</option>
                <option value="rh">RH</option>
                <option value="escala">Escala</option>
                <option value="treinamento">Treinamento</option>
              </select>
            </div>
            <div className="field">
              <label>Título</label>
              <input
                type="text"
                placeholder="Título do aviso"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Conteúdo</label>
              <textarea
                placeholder="Conteúdo do aviso..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} />
              <span style={{ fontSize: "0.88rem" }}>Fixar aviso no topo</span>
            </label>
            <button className="btn btn-primary" type="submit" disabled={carregando}>
              Publicar
            </button>
            <p className={`status-msg ${statusTipo}`}>{status}</p>
          </form>
        </div>
      )}

      {avisos.length === 0 ? (
        <p className="empty">Nenhum aviso publicado.</p>
      ) : (
        avisos.map((a) => (
          <div key={a.id} className={`aviso-card ${a.fixado ? "fixado" : ""}`}>
            <div className="aviso-header">
              <span className={`badge badge-${a.tipo}`}>{labelTipoAviso(a.tipo)}</span>
              {a.fixado && (
                <span style={{ fontSize: "0.75rem", color: "var(--gold-soft)" }}>📌 Fixado</span>
              )}
            </div>
            <p className="aviso-titulo">{a.titulo}</p>
            <p className="aviso-conteudo">{a.conteudo}</p>
            <p className="aviso-meta">
              {a.publicadoPor} · {formatarData(a.publicadoEm)}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
