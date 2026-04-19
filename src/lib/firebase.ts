import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc } from "firebase/firestore";

const cfg = {
  apiKey: "AIzaSyDEP5bGDSeM9yFtsiTndP4u5cchfIgoazg",
  authDomain: "secret-bafa-new2.firebaseapp.com",
  projectId: "secret-bafa-new2",
  storageBucket: "secret-bafa-new2.firebasestorage.app",
  messagingSenderId: "950509113898",
  appId: "1:950509113898:web:24ffd605a66353bc8ca953",
};

export const app = initializeApp(cfg);
export const db = getFirestore(app);

export const F = "formations" as const;
export const C = {
  U: "users",
  S: "secrets",
  V: "votes",
  P: "points",
  SE: "session",
  D: "defis",
} as const;

export type CollectionKey = keyof typeof C;

export function fCol(fid: string, k: CollectionKey) {
  return collection(db, F, fid, C[k]);
}
export function fDoc(fid: string, k: CollectionKey, id: string) {
  return doc(db, F, fid, C[k], id);
}
export function formationDoc(fid: string) {
  return doc(db, F, fid);
}
