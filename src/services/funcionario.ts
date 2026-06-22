import { db, firebaseConfig } from "@/config/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import type { Usuario } from "@/types";

function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === "Secondary");
  const app = existing ?? initializeApp(firebaseConfig, "Secondary");
  return getAuth(app);
}

export async function cadastrarFuncionario(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil: Usuario["perfil"];
  cargo: string;
  setor: string;
  matricula: string;
}): Promise<void> {
  const secondaryAuth = getSecondaryAuth();
  const { user } = await createUserWithEmailAndPassword(
    secondaryAuth,
    dados.email,
    dados.senha
  );

  await setDoc(doc(db, "usuarios", user.uid), {
    uid: user.uid,
    nome: dados.nome,
    email: dados.email,
    perfil: dados.perfil,
    cargo: dados.cargo,
    setor: dados.setor,
    matricula: dados.matricula,
    avatarUrl: "",
    ativo: true,
    criadoEm: new Date().toISOString(),
  });

  await secondaryAuth.signOut();
}

export async function buscarTodosFuncionarios(): Promise<Usuario[]> {
  const q = query(collection(db, "usuarios"), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Usuario);
}

export async function ativarDesativarFuncionario(
  uid: string,
  ativo: boolean
): Promise<void> {
  await updateDoc(doc(db, "usuarios", uid), { ativo });
}
