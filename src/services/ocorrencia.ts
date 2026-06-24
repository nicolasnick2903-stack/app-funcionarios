import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Ocorrencia, StatusOcorrencia } from "@/types";

export async function criarOcorrencia(dados: Omit<Ocorrencia, "id" | "numero" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const snap = await getDocs(collection(db, "ocorrencias"));
  const numero = `OC-${String(snap.size + 1).padStart(3, "0")}`;
  const ref = await addDoc(collection(db, "ocorrencias"), {
    ...dados, numero, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarOcorrencias(): Promise<Ocorrencia[]> {
  const q = query(collection(db, "ocorrencias"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ocorrencia));
}

export async function atualizarStatusOcorrencia(id: string, status: StatusOcorrencia): Promise<void> {
  await updateDoc(doc(db, "ocorrencias", id), { status, atualizadoEm: new Date().toISOString() });
}

export async function excluirOcorrencia(id: string): Promise<void> {
  await deleteDoc(doc(db, "ocorrencias", id));
}
