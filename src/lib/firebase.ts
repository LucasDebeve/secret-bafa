import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
