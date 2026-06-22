import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { Usuario } from "@/types";

interface AuthState {
  user: User | null;
  perfil: Usuario | null;
  carregando: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    perfil: null,
    carregando: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "usuarios", user.uid));
          const perfil = snap.exists() ? (snap.data() as Usuario) : null;
          setState({ user, perfil, carregando: false });
        } catch {
          setState({ user, perfil: null, carregando: false });
        }
      } else {
        setState({ user: null, perfil: null, carregando: false });
      }
    });

    return unsubscribe;
  }, []);

  return state;
}
