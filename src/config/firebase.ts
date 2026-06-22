import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Substitua com as credenciais do seu projeto Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyAi_jfxUstfOkL2RoQDvhy-WXQwY5gdqe4",
  authDomain: "mh-funcionario.firebaseapp.com",
  projectId: "mh-funcionario",
  storageBucket: "mh-funcionario.firebasestorage.app",
  messagingSenderId: "213494974816",
  appId: "1:213494974816:web:535b857a29c012d3643605"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
