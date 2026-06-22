import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { RegistroPonto, StatusPonto } from "@/types";

export async function registrarPonto(
  uid: string,
  tipo: StatusPonto,
  latitude?: number,
  longitude?: number,
  enderecoAproximado?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "pontos"), {
    uid,
    tipo,
    dataHora: new Date().toISOString(),
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    enderecoAproximado: enderecoAproximado ?? null,
    dispositivo: navigator.userAgent,
    criadoEm: Timestamp.now()
  });
  return ref.id;
}

export async function buscarPontosDoMes(uid: string): Promise<RegistroPonto[]> {
  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "pontos"),
    where("uid", "==", uid),
    where("criadoEm", ">=", Timestamp.fromDate(inicio)),
    orderBy("criadoEm", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RegistroPonto));
}

export async function buscarTodosPontos(dataInicio: string, dataFim: string): Promise<RegistroPonto[]> {
  const inicio = Timestamp.fromDate(new Date(dataInicio + "T00:00:00"));
  const fim = Timestamp.fromDate(new Date(dataFim + "T23:59:59"));
  const q = query(
    collection(db, "pontos"),
    where("criadoEm", ">=", inicio),
    where("criadoEm", "<=", fim),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RegistroPonto));
}

export async function editarPonto(id: string, tipo: StatusPonto, dataHora: string): Promise<void> {
  await updateDoc(doc(db, "pontos", id), { tipo, dataHora, editadoEm: new Date().toISOString() });
}

export async function excluirPonto(id: string): Promise<void> {
  await deleteDoc(doc(db, "pontos", id));
}

export async function buscarUltimoPonto(uid: string): Promise<RegistroPonto | null> {
  const q = query(
    collection(db, "pontos"),
    where("uid", "==", uid),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as RegistroPonto;
}
