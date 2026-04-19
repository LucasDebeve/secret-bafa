import { useState } from "react";
import { deleteDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { fCol, fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";

export default function AdminSecrets() {
  const { me, fid } = useAuth();
  const { cS, cV } = useData();
  const toast = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (!fid || !me?.isAdmin) return null;

  const voteCount: Record<string, number> = {};
  cV.forEach((v) => { voteCount[v.sid] = (voteCount[v.sid] || 0) + 1; });

  const save = async (id: string) => {
    const t = draft.trim();
    if (!t) return;
    await updateDoc(fDoc(fid, "S", id), { text: t });
    toast("Modifie.", "ok");
    setEditing(null);
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce secret ?")) return;
    await deleteDoc(fDoc(fid, "S", id));
    const vSnap = await getDocs(query(fCol(fid, "V"), where("sid", "==", id)));
    await Promise.all(vSnap.docs.map((d) => deleteDoc(fDoc(fid, "V", d.id))));
    toast("Supprime.", "ok");
  };

  const hide = async (id: string) => {
    if (!confirm("Recacher ce secret ?")) return;
    await updateDoc(fDoc(fid, "S", id), { found: false, foundBy: null });
    toast("Secret recache.", "nf");
  };

  const empty = !cS.length;

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Tous les secrets</div></div>

      {/* Table — desktop */}
      <div className="hidden md:block card-body card-body-tight overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr><th>Auteur</th><th>Secret</th><th>Votes</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {empty ? (
              <tr><td colSpan={5} className="text-center py-6 text-app-text3">Aucun secret.</td></tr>
            ) : cS.map((s) => (
              <tr key={s.id}>
                <td><span className="font-semibold text-accent text-[12px]">{s.uid}</span></td>
                <td className="max-w-[200px] italic text-app-text2">
                  {editing === s.id
                    ? <input className="inp !py-1.5" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} />
                    : s.text}
                </td>
                <td>{voteCount[s.id] || 0}</td>
                <td>{s.found ? <span className="badge badge-green">Trouve</span> : <span className="badge badge-gray">Mystere</span>}</td>
                <td className="flex gap-1.5 flex-wrap">
                  {editing === s.id
                    ? <button className="btn btn-sm" onClick={() => save(s.id)}>Sauver</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s.id); setDraft(s.text); }}>Modifier</button>}
                  <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>Supprimer</button>
                  {s.found && <button className="btn btn-ghost btn-sm" onClick={() => hide(s.id)}>Recacher</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartes — mobile */}
      <div className="md:hidden">
        {empty ? (
          <div className="empty-state">Aucun secret.</div>
        ) : cS.map((s) => (
          <div key={s.id} className="px-4 py-3.5 border-b border-app-border last:border-b-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-semibold text-accent text-[12px]">{s.uid}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-app-text3">{voteCount[s.id] || 0} vote(s)</span>
                {s.found ? <span className="badge badge-green">Trouve</span> : <span className="badge badge-gray">Mystere</span>}
              </div>
            </div>
            {editing === s.id ? (
              <input className="inp !py-1.5 mb-2.5" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} />
            ) : (
              <div className="text-[13px] italic text-app-text2 mb-2.5">"{s.text}"</div>
            )}
            <div className="flex gap-1.5 flex-wrap">
              {editing === s.id
                ? <button className="btn btn-sm" onClick={() => save(s.id)}>Sauver</button>
                : <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s.id); setDraft(s.text); }}>Modifier</button>}
              <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>Supprimer</button>
              {s.found && <button className="btn btn-ghost btn-sm" onClick={() => hide(s.id)}>Recacher</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
