import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase";
import { Atestado, TipoAtestado } from "@/types";

export async function enviarAtestado(
  uid: string,
  nomeFunc: string,
  tipo: TipoAtestado,
  dataAfastamento: string,
  diasAfastamento: number,
  arquivo: File,
  observacao?: string
): Promise<string> {
  const ext = arquivo.name.split(".").pop();
  const nomeArquivo = `atestado_${uid}_${Date.now()}.${ext}`;
  const storageRef = ref(storage, `atestados/${uid}/${nomeArquivo}`);

  await uploadBytes(storageRef, arquivo);
  const arquivoUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, "atestados"), {
    uid,
    nomeFunc,
    tipo,
    dataAfastamento,
    diasAfastamento,
    arquivoUrl,
    nomeArquivo: arquivo.name,
    observacao: observacao ?? "",
    status: "pendente",
    criadoEm: new Date().toISOString(),
    criadoTs: Timestamp.now()
  });

  return docRef.id;
}

export async function buscarMeusAtestados(uid: string): Promise<Atestado[]> {
  const q = query(
    collection(db, "atestados"),
    where("uid", "==", uid),
    orderBy("criadoTs", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Atestado));
}

export async function buscarTodosAtestados(): Promise<Atestado[]> {
  const q = query(collection(db, "atestados"), orderBy("criadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Atestado));
}

export async function atualizarStatusAtestado(
  id: string,
  status: "aprovado" | "rejeitado",
  aprovadoPor: string,
  motivoRejeicao?: string
) {
  await updateDoc(doc(db, "atestados", id), {
    status,
    aprovadoPor,
    motivoRejeicao: motivoRejeicao ?? null,
    atualizadoEm: new Date().toISOString()
  });
}
