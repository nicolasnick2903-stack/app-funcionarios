import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { EscalaTrabalho } from "@/types";

export async function criarEscala(dados: Omit<EscalaTrabalho, "id" | "criadoEm">): Promise<string> {
  const ref = await addDoc(collection(db, "escalas"), {
    ...dados,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarEscalas(): Promise<EscalaTrabalho[]> {
  const q = query(collection(db, "escalas"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as EscalaTrabalho));
}

export async function excluirEscala(id: string): Promise<void> {
  await deleteDoc(doc(db, "escalas", id));
}
