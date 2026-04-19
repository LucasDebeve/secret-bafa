import { useState } from "react";
import { addDoc, deleteDoc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { fCol, fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  pending: { cls: "badge-purple", label: "En cours" },
  success: { cls: "badge-green", label: "Reussi" },
  failed: { cls: "badge-red", label: "Echoue" },
};

export default function AdminDefis() {
  const { fid } = useAuth();
  const { cS, cD } = useData();
  const toast = useToast();
  const [to, setTo] = useState("");
  const [voter, setVoter] = useState("");
  const [secretId, setSecretId] = useState("");
  const [target, setTarget] = useState("");
  const [err, setErr] = useState("");

  if (!fid) return null;

  const uids = [...new Set(cS.map((s) => s.uid))].filter((u) => u !== "admin");

  const create = async () => {
    setErr("");
    if (!to || !voter || !secretId || !target) return setErr("Remplis tous les champs.");
    if (to === voter) return setErr("Le participant ne peut pas avoir un defi sur lui-meme.");
    await addDoc(fCol(fid, "D"), {
      assignedTo: to,
      targetVoter: voter,
      secretId,
      targetAuthor: target,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    toast(`Defi cree pour ${to} !`, "ok");
    setTo(""); setVoter(""); setSecretId(""); setTarget("");
  };

  const resolveDefi = async (id: string, status: "success" | "failed") => {
    const d = cD.find((x) => x.id === id);
    if (!d) return;
    await updateDoc(fDoc(fid, "D", id), { status });
    if (status === "success") {
      const pRef = fDoc(fid, "P", d.assignedTo);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        await updateDoc(pRef, { total: increment(3), history: [...(pSnap.data().history || []), { type: "defi", pts: 3, ts: Date.now() }] });
      } else {
        await setDoc(pRef, { total: 3, history: [{ type: "defi", pts: 3, ts: Date.now() }] });
      }
      toast(`Defi reussi par ${d.assignedTo} ! +3 pts`, "ok");
    } else {
      toast("Defi marque comme echoue.", "nf");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce defi ?")) return;
    await deleteDoc(fDoc(fid, "D", id));
    toast("Defi supprime.", "ok");
  };

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Gerer les defis</div></div>
      <div className="card-body">
        <div className="grid grid-cols-2 gap-3 mb-4 max-md:grid-cols-1">
          <div>
            <label className="lbl">DONNER LE DEFI A</label>
            <select className="inp" value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Choisir</option>
              {uids.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">DOIT FAIRE VOTER</label>
            <select className="inp" value={voter} onChange={(e) => setVoter(e.target.value)}>
              <option value="">Choisir</option>
              {uids.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">SUR CE SECRET</label>
            <select className="inp" value={secretId} onChange={(e) => setSecretId(e.target.value)}>
              <option value="">Choisir un secret</option>
              {cS.map((s) => <option key={s.id} value={s.id}>{s.text.slice(0, 50)}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">POUR CET AUTEUR</label>
            <select className="inp" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Choisir</option>
              {uids.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        {err && <div className="err mb-2">{err}</div>}
        <button className="btn btn-sm" onClick={create}>Creer le defi</button>
      </div>
      <div className="card-body card-body-tight border-t border-app-border overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Assigne a</th><th>Faire voter</th><th>Secret</th><th>Pour</th><th>Statut</th><th>Action</th></tr></thead>
          <tbody>
            {!cD.length ? (
              <tr><td colSpan={6} className="text-center py-6 text-app-text3">Aucun defi.</td></tr>
            ) : cD.map((d) => {
              const s = cS.find((x) => x.id === d.secretId);
              const st = STATUS_BADGE[d.status] || { cls: "badge-gray", label: "—" };
              return (
                <tr key={d.id}>
                  <td><span className="font-semibold text-accent text-[12px]">{d.assignedTo}</span></td>
                  <td><strong className="text-brand-purple">{d.targetVoter}</strong></td>
                  <td className="max-w-[200px] italic text-app-text2">{s ? s.text.slice(0, 40) : "?"}</td>
                  <td><strong className="text-accent">{d.targetAuthor}</strong></td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td className="flex gap-1.5 flex-wrap">
                    {d.status === "pending" && (
                      <>
                        <button className="btn btn-green btn-sm" onClick={() => resolveDefi(d.id, "success")}>Reussi</button>
                        <button className="btn btn-danger btn-sm" onClick={() => resolveDefi(d.id, "failed")}>Echoue</button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => del(d.id)}>Suppr.</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
