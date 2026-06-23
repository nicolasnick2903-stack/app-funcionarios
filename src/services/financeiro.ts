import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Transacao, TipoTransacao, CategoriaTransacao } from "@/types";

export async function lancarTransacao(
  tipo: TipoTransacao,
  valor: number,
  descricao: string,
  categoria: CategoriaTransacao,
  criadoPor: string,
  data: string,
  condominioId?: string,
  condominioNome?: string,
  observacao?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "financeiro"), {
    tipo, valor, descricao, categoria, criadoPor, data,
    condominioId: condominioId ?? null,
    condominioNome: condominioNome ?? null,
    observacao: observacao ?? "",
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarTransacoesPorMes(ano: number, mes: number): Promise<Transacao[]> {
  const mm = String(mes).padStart(2, "0");
  const inicio = `${ano}-${mm}-01`;
  const fimDate = new Date(ano, mes, 0);
  const dd = String(fimDate.getDate()).padStart(2, "0");
  const fim = `${ano}-${mm}-${dd}`;
  const q = query(
    collection(db, "financeiro"),
    where("data", ">=", inicio),
    where("data", "<=", fim),
    orderBy("data", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transacao));
}

export async function excluirTransacao(id: string): Promise<void> {
  await deleteDoc(doc(db, "financeiro", id));
}

export async function editarTransacao(id: string, dados: Partial<Transacao>): Promise<void> {
  await updateDoc(doc(db, "financeiro", id), { ...dados, atualizadoEm: new Date().toISOString() });
}
