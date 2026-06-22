import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
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
