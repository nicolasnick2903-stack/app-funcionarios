import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { enviarAtestado, buscarMeusAtestados } from "@/services/atestado";
import { formatarData, labelStatus, labelTipoAtestado } from "@/utils/format";
import { Atestado, TipoAtestado } from "@/types";

export default function AtestadoScreen() {
  const { user, perfil } = useAuth();
  const [lista, setLista] = useState<Atestado[]>([]);
  const [tipo, setTipo] = useState<TipoAtestado>("medico");
  const [dataAfastamento, setDataAfastamento] = useState("");
  const [dias, setDias] = useState(1);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [obs, setObs] = useState("");
  const [status, setStatus] = useState("");
  const [statusTipo, setStatusTipo] = useState<"" | "error" | "success">("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) buscarMeusAtestados(user.uid).then(setLista);
  }, [user]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !perfil || !arquivo) {
      setStatusTipo("error");
      setStatus("Selecione o arquivo do atestado.");
      return;
    }
    if (!dataAfastamento) {
      setStatusTipo("error");
      setStatus("Informe a data de afastamento.");
      return;
    }
    setCarregando(true);
    setStatus("Enviando atestado...");
    setStatusTipo("");
    try {
      await enviarAtestado(user.uid, perfil.nome, tipo, dataAfastamento, dias, arquivo, obs);
      setStatusTipo("success");
      setStatus("Atestado enviado com sucesso!");
      setArquivo(null);
      setDataAfastamento("");
      setDias(1);
      setObs("");
      const novaLista = await buscarMeusAtestados(user.uid);
      setLista(novaLista);
    } catch {
      setStatusTipo("error");
      setStatus("Erro ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="screen">
      <p className="eyebrow">Saúde Ocupacional</p>
      <h1 className="screen-title">Atestado Médico</h1>

      <div className="card">
        <p className="card-title">Enviar Atestado</p>
        <form onSubmit={handleEnviar}>
          <div className="field">
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAtestado)}>
              <option value="medico">Médico</option>
              <option value="odontologico">Odontológico</option>
              <option value="psicologico">Psicológico</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="field">
            <label>Data de Afastamento</label>
            <input
              type="date"
              value={dataAfastamento}
              onChange={(e) => setDataAfastamento(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Dias de Afastamento</label>
            <input
              type="number"
              min={1}
              max={365}
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              required
            />
          </div>
          <div className="field">
            <label>Arquivo (foto ou PDF)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              required
            />
            {arquivo && (
              <span style={{ fontSize: "0.8rem", color: "var(--gold-soft)" }}>
                {arquivo.name}
              </span>
            )}
          </div>
          <div className="field">
            <label>Observação (opcional)</label>
            <textarea
              placeholder="Detalhes adicionais..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={carregando}>
            Enviar Atestado
          </button>
          <p className={`status-msg ${statusTipo}`}>{status}</p>
        </form>
      </div>

      <div className="card">
        <p className="card-title">Meus Atestados</p>
        {lista.length === 0 ? (
          <p className="empty">Nenhum atestado enviado.</p>
        ) : (
          lista.map((a) => (
            <div key={a.id} className="history-item">
              <div className="history-item-left">
                <strong>{labelTipoAtestado(a.tipo)}</strong>
                <span>{formatarData(a.dataAfastamento)} · {a.diasAfastamento} dia(s)</span>
                <a
                  href={a.arquivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--gold-soft)", fontSize: "0.78rem" }}
                >
                  Ver arquivo
                </a>
              </div>
              <span className={`badge badge-${a.status}`}>{labelStatus(a.status)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
