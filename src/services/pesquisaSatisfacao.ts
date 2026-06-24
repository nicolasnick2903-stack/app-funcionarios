import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { PesquisaSatisfacao } from "@/types";

export async function criarPesquisa(dados: Omit<PesquisaSatisfacao, "id" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const ref = await addDoc(collection(db, "pesquisas_satisfacao"), {
    ...dados, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarPesquisas(): Promise<PesquisaSatisfacao[]> {
  const q = query(collection(db, "pesquisas_satisfacao"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PesquisaSatisfacao));
}

export async function excluirPesquisa(id: string): Promise<void> {
  await deleteDoc(doc(db, "pesquisas_satisfacao", id));
}
