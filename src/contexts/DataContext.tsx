import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { fCol, fDoc, formationDoc } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import type { Defi, Points, Secret, Session, User, Vote } from "../types";

type DataState = {
  cSess: Session;
  cS: Secret[];
  cV: Vote[];
  cP: Record<string, Points>;
  cD: Defi[];
  cU: User[];
  formationName: string | null;
};

const DEFAULT_SESS: Session = { open: false };

const Ctx = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { fid } = useAuth();
  const [cSess, setCSess] = useState<Session>(DEFAULT_SESS);
  const [cS, setCS] = useState<Secret[]>([]);
  const [cV, setCV] = useState<Vote[]>([]);
  const [cP, setCP] = useState<Record<string, Points>>({});
  const [cD, setCD] = useState<Defi[]>([]);
  const [cU, setCU] = useState<User[]>([]);
  const [formationName, setFormationName] = useState<string | null>(null);

  useEffect(() => {
    if (!fid) {
      setCSess(DEFAULT_SESS);
      setCS([]);
      setCV([]);
      setCP({});
      setCD([]);
      setCU([]);
      setFormationName(null);
      return;
    }

    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(formationDoc(fid), (s) => {
        const n = s.exists() ? (s.data().name as string | undefined) : undefined;
        setFormationName(n || null);
      })
    );
    unsubs.push(
      onSnapshot(fDoc(fid, "SE", "current"), (s) => {
        setCSess(s.exists() ? (s.data() as Session) : DEFAULT_SESS);
      })
    );
    unsubs.push(
      onSnapshot(fCol(fid, "P"), (s) => {
        const out: Record<string, Points> = {};
        s.docs.forEach((d) => { out[d.id] = d.data() as Points; });
        setCP(out);
      })
    );
    unsubs.push(
      onSnapshot(fCol(fid, "D"), (s) => {
        setCD(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Defi, "id">) })));
      })
    );
    unsubs.push(
      onSnapshot(query(fCol(fid, "S"), orderBy("createdAt", "desc")), (s) => {
        setCS(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Secret, "id">) })));
      })
    );
    unsubs.push(
      onSnapshot(fCol(fid, "V"), (s) => {
        setCV(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vote, "id">) })));
      })
    );
    unsubs.push(
      onSnapshot(fCol(fid, "U"), (s) => {
        setCU(s.docs.map((d) => d.data() as User).filter((u) => !u.isAdmin));
      })
    );

    return () => { unsubs.forEach((u) => u()); };
  }, [fid]);

  const value = useMemo<DataState>(() => ({ cSess, cS, cV, cP, cD, cU, formationName }), [cSess, cS, cV, cP, cD, cU, formationName]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData outside provider");
  return v;
}
