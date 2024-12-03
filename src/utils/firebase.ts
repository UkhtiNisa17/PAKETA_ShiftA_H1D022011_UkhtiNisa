// src/utils/firebase.ts
// modifikasi src/utils/firebase.ts
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAovxivgWfq0IAURBCYl7gMUIJwGfmZdPY",
  authDomain: "balapan-de38b.firebaseapp.com",
  projectId: "balapan-de38b",
  storageBucket: "balapan-de38b.firebasestorage.app",
  messagingSenderId: "626147529814",
  appId: "1:626147529814:web:80c7f84956088d6ff097f7",
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export { auth, googleProvider, db };
