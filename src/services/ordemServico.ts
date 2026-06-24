import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { OrdemServico, StatusOS } from "@/types";

export async function criarOS(dados: Omit<OrdemServico, "id" | "numero" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const snap = await getDocs(collection(db, "ordens_servico"));
  const numero = `OS-${String(snap.size + 1).padStart(3, "0")}`;
  const ref = await addDoc(collection(db, "ordens_servico"), {
    ...dados, numero, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarOS(): Promise<OrdemServico[]> {
  const q = query(collection(db, "ordens_servico"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as OrdemServico));
}

export async function atualizarStatusOS(id: string, status: StatusOS): Promise<void> {
  await updateDoc(doc(db, "ordens_servico", id), { status, atualizadoEm: new Date().toISOString() });
}

export async function excluirOS(id: string): Promise<void> {
  await deleteDoc(doc(db, "ordens_servico", id));
}
