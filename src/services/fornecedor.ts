import { db } from "@/config/firebase";
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, orderBy, Timestamp,
} from "firebase/firestore";
import type { Fornecedor } from "@/types";

export async function buscarFornecedores(): Promise<Fornecedor[]> {
  const q = query(collection(db, "fornecedores"), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Fornecedor));
}

export async function cadastrarFornecedor(
  dados: Omit<Fornecedor, "id" | "criadoEm" | "atualizadoEm">
): Promise<string> {
  const ref = await addDoc(collection(db, "fornecedores"), {
    ...dados,
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now(),
  });
  return ref.id;
}

export async function editarFornecedor(
  id: string,
  dados: Partial<Omit<Fornecedor, "id" | "criadoEm">>
): Promise<void> {
  await updateDoc(doc(db, "fornecedores", id), {
    ...dados,
    atualizadoEm: new Date().toISOString(),
  });
}

export async function ativarDesativarFornecedor(id: string, ativo: boolean): Promise<void> {
  await updateDoc(doc(db, "fornecedores", id), { ativo, atualizadoEm: new Date().toISOString() });
}
