import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { ReciboServico } from "@/types";

export async function criarRecibo(dados: Omit<ReciboServico, "id" | "numero" | "criadoEm" | "criadoPor">, criadoPor: string): Promise<string> {
  const snap = await getDocs(collection(db, "recibos"));
  const numero = `REC-${String(snap.size + 1).padStart(3, "0")}`;
  const ref = await addDoc(collection(db, "recibos"), {
    ...dados, numero, criadoPor,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function buscarRecibos(): Promise<ReciboServico[]> {
  const q = query(collection(db, "recibos"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReciboServico));
}

export async function excluirRecibo(id: string): Promise<void> {
  await deleteDoc(doc(db, "recibos", id));
}
