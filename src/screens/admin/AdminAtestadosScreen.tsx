import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { buscarTodosAtestados, atualizarStatusAtestado } from "@/services/atestado";
import { formatarData, labelStatus, labelTipoAtestado } from "@/utils/format";
import { Atestado } from "@/types";

export default function AdminAtestadosScreen() {
  const { perfil } = useAuth();
  const [lista, setLista] = useState<Atestado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendente" | "aprovado" | "rejeitado">("pendente");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarTodosAtestados();
    setLista(dados);
    setCarregando(false);
  }

  async function handleAprovar(id: string) {
    if (!perfil) return;
    await atualizarStatusAtestado(id, "aprovado", perfil.nome);
    await carregar();
  }

  async function handleRejeitar(id: string) {
    if (!perfil || !motivoRejeicao.trim()) return;
    await atualizarStatusAtestado(id, "rejeitado", perfil.nome, motivoRejeicao);
    setRejeitandoId(null);
    setMotivoRejeicao("");
    await carregar();
  }

  const listaFiltrada = filtro === "todos" ? lista : lista.filter((a) => a.status === filtro);
  const pendentes = lista.filter((a) => a.status === "pendente").length;

  return (
    <div className="screen">
      <p className="eyebrow">Admin</p>
      <h1 className="screen-title">Atestados</h1>

      {pendentes > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--warning)", padding: "10px 14px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--warning)", fontWeight: 700 }}>
            {pendentes} atestado{pendentes > 1 ? "s" : ""} aguardando analise
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {(["pendente", "aprovado", "rejeitado", "todos"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${filtro === f ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, minHeight: 36, fontSize: "0.78rem" }}
            onClick={() => setFiltro(f)}
          >
            {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {carregando && <p className="empty">Carregando...</p>}
      {!carregando && listaFiltrada.length === 0 && (
        <p className="empty">Nenhum atestado {filtro !== "todos" ? filtro : "encontrado"}.</p>
      )}

      {listaFiltrada.map((a) => (
        <div
          key={a.id}
          className="card"
          style={{ marginBottom: 12, borderLeft: a.status === "pendente" ? "3px solid var(--warning)" : undefined }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{a.nomeFunc}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                {labelTipoAtestado(a.tipo)} · {formatarData(a.dataAfastamento)} · {a.diasAfastamento} dia(s)
              </p>
              {a.observacao && (
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{a.observacao}</p>
              )}
              {a.motivoRejeicao && (
                <p style={{ fontSize: "0.78rem", color: "var(--danger)", marginTop: 4 }}>
                  Motivo: {a.motivoRejeicao}
                </p>
              )}
              {a.aprovadoPor && (
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                  Por: {a.aprovadoPor}
                </p>
              )}
            </div>
            <span className={"badge badge-" + a.status}>{labelStatus(a.status)}</span>
          </div>

          <a
            href={a.arquivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gold-soft)", fontSize: "0.82rem", marginBottom: a.status === "pendente" ? 12 : 0 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Ver arquivo
          </a>

          {a.status === "pendente" && (
            <>
              {rejeitandoId === a.id ? (
                <div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Motivo da rejeicao"
                      value={motivoRejeicao}
                      onChange={(e) => setMotivoRejeicao(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleRejeitar(a.id)}>
                      Confirmar
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRejeitandoId(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAprovar(a.id)}>
                    Aprovar
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => { setRejeitandoId(a.id); setMotivoRejeicao(""); }}
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
