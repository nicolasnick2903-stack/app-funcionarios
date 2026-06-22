import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";

export async function login(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export async function logout() {
  return signOut(auth);
}

export async function recuperarSenha(email: string) {
  return sendPasswordResetEmail(auth, email);
}
