import { collection, addDoc, query, orderBy, getDocs, Timestamp, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Aviso, TipoAviso, Perfil } from "@/types";

export async function publicarAviso(
  titulo: string,
  conteudo: string,
  tipo: TipoAviso,
  publicadoPor: string,
  fixado = false,
  visivelPara: Perfil[] | "todos" = "todos"
): Promise<string> {
  const ref = await addDoc(collection(db, "avisos"), {
    titulo,
    conteudo,
    tipo,
    publicadoPor,
    publicadoEm: new Date().toISOString(),
    publicadoTs: Timestamp.now(),
    fixado,
    visivelPara
  });
  return ref.id;
}

export async function buscarAvisos(): Promise<Aviso[]> {
  const q = query(collection(db, "avisos"), orderBy("publicadoTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aviso));
}

export async function buscarAvisosFixados(): Promise<Aviso[]> {
  const q = query(
    collection(db, "avisos"),
    where("fixado", "==", true),
    orderBy("publicadoTs", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aviso));
}
