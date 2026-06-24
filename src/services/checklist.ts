import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Checklist } from "@/types";

export async function criarChecklist(dados: Omit<Checklist, "id" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const ref = await addDoc(collection(db, "checklists"), {
    ...dados, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarChecklists(): Promise<Checklist[]> {
  const q = query(collection(db, "checklists"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Checklist));
}

export async function excluirChecklist(id: string): Promise<void> {
  await deleteDoc(doc(db, "checklists", id));
}
