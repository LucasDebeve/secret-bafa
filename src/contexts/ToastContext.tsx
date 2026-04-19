import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ToastKind } from "../types";

type ToastCtx = (msg: string, kind?: ToastKind) => void;

const Ctx = createContext<ToastCtx>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState("");
  const [kind, setKind] = useState<ToastKind>("");
  const [show, setShow] = useState(false);
  const tRef = useRef<number | null>(null);

  const toast = useCallback<ToastCtx>((m, k = "") => {
    setMsg(m);
    setKind(k);
    setShow(true);
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setShow(false), 3800);
  }, []);

  useEffect(() => () => { if (tRef.current) window.clearTimeout(tRef.current); }, []);

  const base = "fixed bottom-6 right-6 px-4 py-3 rounded-[10px] text-[13px] font-medium z-[9999] transition max-w-[300px] shadow-toast text-white";
  const pos = show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none";
  const color =
    kind === "ok" ? "bg-brand-green" :
    kind === "er" ? "bg-brand-red" :
    kind === "nf" ? "bg-brand-purple" :
    "bg-app-text";

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className={`${base} ${pos} ${color}`}>{msg}</div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
