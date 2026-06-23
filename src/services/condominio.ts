import { db } from "@/config/firebase";
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, orderBy, Timestamp,
} from "firebase/firestore";
import type { Condominio } from "@/types";

export async function buscarCondominios(): Promise<Condominio[]> {
  const q = query(collection(db, "condominios"), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Condominio));
}

export async function cadastrarCondominio(
  dados: Omit<Condominio, "id" | "criadoEm" | "atualizadoEm">
): Promise<string> {
  const ref = await addDoc(collection(db, "condominios"), {
    ...dados,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function editarCondominio(
  id: string,
  dados: Partial<Omit<Condominio, "id" | "criadoEm">>
): Promise<void> {
  await updateDoc(doc(db, "condominios", id), {
    ...dados,
    atualizadoEm: new Date().toISOString(),
  });
}

export async function ativarDesativarCondominio(id: string, ativo: boolean): Promise<void> {
  await updateDoc(doc(db, "condominios", id), { ativo, atualizadoEm: new Date().toISOString() });
}
