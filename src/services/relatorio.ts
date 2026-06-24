import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { RelatorioMensal, StatusRelatorio } from "@/types";

export async function criarRelatorio(dados: Omit<RelatorioMensal, "id" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const ref = await addDoc(collection(db, "relatorios_mensais"), {
    ...dados, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarRelatorios(): Promise<RelatorioMensal[]> {
  const q = query(collection(db, "relatorios_mensais"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RelatorioMensal));
}

export async function atualizarStatusRelatorio(id: string, status: StatusRelatorio): Promise<void> {
  await updateDoc(doc(db, "relatorios_mensais", id), { status, atualizadoEm: new Date().toISOString() });
}

export async function excluirRelatorio(id: string): Promise<void> {
  await deleteDoc(doc(db, "relatorios_mensais", id));
}
