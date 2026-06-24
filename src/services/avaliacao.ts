import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { AvaliacaoDesempenho } from "@/types";

export async function criarAvaliacao(dados: Omit<AvaliacaoDesempenho, "id" | "criadoEm">): Promise<string> {
  const ref = await addDoc(collection(db, "avaliacoes"), {
    ...dados,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarAvaliacoes(): Promise<AvaliacaoDesempenho[]> {
  const q = query(collection(db, "avaliacoes"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AvaliacaoDesempenho));
}

export async function excluirAvaliacao(id: string): Promise<void> {
  await deleteDoc(doc(db, "avaliacoes", id));
}
