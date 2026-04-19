import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { fDoc, formationDoc } from "../lib/firebase";
import { genSalt, hashPassword, normFid, normUserId } from "../lib/crypto";
import type { SafeUser } from "../types";

type AuthState = {
  me: SafeUser | null;
  fid: string | null;
  login: (fCode: string, id: string, pw: string) => Promise<string | null>;
  createFormation: (args: {
    code: string;
    name: string;
    prenom: string;
    nom: string;
    pw: string;
  }) => Promise<string | null>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

function readStored<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<SafeUser | null>(() => readStored<SafeUser>("sb_me"));
  const [fid, setFid] = useState<string | null>(() => sessionStorage.getItem("sb_fid"));

  const login = useCallback<AuthState["login"]>(async (fCode, id, pw) => {
    const code = normFid(fCode);
    if (!code || !id || !pw) return "Remplis tous les champs.";
    try {
      const fSnap = await getDoc(formationDoc(code));
      if (!fSnap.exists()) return "Formation introuvable. Verifie le code.";
      const uSnap = await getDoc(fDoc(code, "U", id.trim()));
      if (!uSnap.exists()) return "Identifiant ou mot de passe incorrect.";
      const user = uSnap.data() as { id: string; pwHash?: string; pwSalt?: string; prenom?: string; nom?: string; isAdmin?: boolean };
      const hash = await hashPassword(pw, user.pwSalt || "");
      if (hash !== user.pwHash) return "Identifiant ou mot de passe incorrect.";
      const safe: SafeUser = {
        id: user.id,
        prenom: user.prenom || "",
        nom: user.nom || "",
        isAdmin: !!user.isAdmin,
      };
      sessionStorage.setItem("sb_me", JSON.stringify(safe));
      sessionStorage.setItem("sb_fid", code);
      setMe(safe);
      setFid(code);
      return null;
    } catch (e) {
      console.error(e);
      return "Erreur. Verifie les regles Firestore.";
    }
  }, []);

  const createFormation = useCallback<AuthState["createFormation"]>(async ({ code, name, prenom, nom, pw }) => {
    const c = normFid(code);
    if (!c || !name || !prenom || !nom || !pw) return "Remplis tous les champs.";
    if (pw.length < 6) return "Mot de passe trop court (6 caracteres min).";
    try {
      const existing = await getDoc(formationDoc(c));
      if (existing.exists()) return "Ce code de formation existe deja.";
      await setDoc(formationDoc(c), { name, createdAt: serverTimestamp() });
      const adminId = normUserId(prenom) + "." + normUserId(nom);
      const salt = genSalt();
      const pwHash = await hashPassword(pw, salt);
      await setDoc(fDoc(c, "U", adminId), { id: adminId, prenom, nom, isAdmin: true, pwHash, pwSalt: salt });
      await setDoc(fDoc(c, "SE", "current"), { open: false, sessCount: 0 });
      const safe: SafeUser = { id: adminId, prenom, nom, isAdmin: true };
      sessionStorage.setItem("sb_me", JSON.stringify(safe));
      sessionStorage.setItem("sb_fid", c);
      setMe(safe);
      setFid(c);
      return null;
    } catch (e) {
      console.error(e);
      return "Erreur lors de la creation.";
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("sb_me");
    sessionStorage.removeItem("sb_fid");
    setMe(null);
    setFid(null);
  }, []);

  return <Ctx.Provider value={{ me, fid, login, createFormation, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
