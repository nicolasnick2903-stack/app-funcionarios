import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SolicitacaoFerias } from "@/types";

export async function solicitarFerias(
  uid: string,
  nomeFunc: string,
  dataInicio: string,
  dataFim: string,
  observacao?: string
): Promise<string> {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const dias = Math.ceil((fim.getTime() - inicio.getTime()) / 86400000) + 1;

  const ref = await addDoc(collection(db, "ferias"), {
    uid,
    nomeFunc,
    dataInicio,
    dataFim,
    diasSolicitados: dias,
    observacao: observacao ?? "",
    status: "pendente",
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now()
  });
  return ref.id;
}

export async function buscarMinhasFerias(uid: string): Promise<SolicitacaoFerias[]> {
  const q = query(
    collection(db, "ferias"),
    where("uid", "==", uid),
    orderBy("criadoTs", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SolicitacaoFerias));
}

export async function atualizarStatusFerias(
  id: string,
  status: "aprovado" | "rejeitado",
  aprovadoPor: string,
  motivoRejeicao?: string
) {
  await updateDoc(doc(db, "ferias", id), {
    status,
    aprovadoPor,
    motivoRejeicao: motivoRejeicao ?? null,
    atualizadoEm: new Date().toISOString()
  });
}
