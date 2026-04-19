import { getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";

export default function AdminVotes() {
  const { me, fid } = useAuth();
  const { cS, cV } = useData();
  const toast = useToast();
  if (!fid || !me?.isAdmin) return null;

  const givePoints = async (vid: string, voter: string, correct: boolean) => {
    const v = cV.find((x) => x.id === vid);
    if (!v) return;
    await updateDoc(fDoc(fid, "V", vid), { validated: true, pointsGiven: true, adminValidated: correct });
    if (correct) {
      const pRef = fDoc(fid, "P", voter);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        await updateDoc(pRef, { total: increment(3), history: [...(pSnap.data().history || []), { type: "vote", pts: 3, ts: Date.now() }] });
      } else {
        await setDoc(pRef, { total: 3, history: [{ type: "vote", pts: 3, ts: Date.now() }] });
      }
      const sRef = fDoc(fid, "S", v.sid);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists() && !sSnap.data().found) {
        await updateDoc(sRef, { found: true, foundBy: voter });
      }
      toast(`+3 pts pour ${voter}`, "ok");
    } else {
      toast("Refuse — 0 pt.", "nf");
    }
  };

  const sorted = [...cV].sort((a, b) => (a.validated ? 1 : 0) - (b.validated ? 1 : 0));
  const empty = !cV.length;

  const StatusBadge = ({ v }: { v: typeof cV[number] }) => {
    if (v.validated) return v.adminValidated
      ? <span className="badge badge-green">+3 pts</span>
      : <span className="badge badge-red">Refuse</span>;
    return v.guess === v.secretUid
      ? <span className="badge badge-blue">Correct</span>
      : <span className="badge badge-amber">Incorrect</span>;
  };

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Valider les propositions</div>
        <span className="badge badge-blue hidden sm:inline-flex">+3 pts si correct · +1 pt defense</span>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block card-body card-body-tight overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Votant</th><th>Secret</th><th>A devine</th><th>Vrai auteur</th><th>Statut</th><th>Action</th></tr></thead>
          <tbody>
            {empty ? (
              <tr><td colSpan={6} className="text-center py-6 text-app-text3">Aucun vote.</td></tr>
            ) : sorted.map((v) => {
              const s = cS.find((x) => x.id === v.sid);
              return (
                <tr key={v.id} style={v.validated ? { opacity: 0.55 } : undefined}>
                  <td><span className="font-semibold text-accent text-[12px]">{v.voter}</span></td>
                  <td className="max-w-[200px] italic text-app-text2">{s ? `${s.text.slice(0, 45)}${s.text.length > 45 ? "..." : ""}` : <em className="opacity-50">supprime</em>}</td>
                  <td><strong className="text-brand-purple">{v.guess}</strong></td>
                  <td><strong className="text-accent">{v.secretUid || "?"}</strong></td>
                  <td><StatusBadge v={v} /></td>
                  <td>
                    {v.validated ? (
                      <span className="text-[12px] text-app-text3">Traite</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <button className="btn btn-green btn-sm" onClick={() => givePoints(v.id, v.voter, true)}>+3 pts</button>
                        <button className="btn btn-danger btn-sm" onClick={() => givePoints(v.id, v.voter, false)}>Refuser</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartes — mobile */}
      <div className="md:hidden">
        {empty ? (
          <div className="empty-state">Aucun vote.</div>
        ) : sorted.map((v) => {
          const s = cS.find((x) => x.id === v.sid);
          return (
            <div key={v.id} className="px-4 py-3.5 border-b border-app-border last:border-b-0" style={v.validated ? { opacity: 0.6 } : undefined}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-accent text-[13px]">{v.voter}</span>
                <StatusBadge v={v} />
              </div>
              <div className="text-[12px] text-app-text3 mb-0.5">
                A devine <strong className="text-brand-purple">{v.guess}</strong> · vrai auteur : <strong className="text-accent">{v.secretUid || "?"}</strong>
              </div>
              {s && (
                <div className="text-[12px] italic text-app-text2 mb-2.5">
                  "{s.text.slice(0, 60)}{s.text.length > 60 ? "..." : ""}"
                </div>
              )}
              {!v.validated && (
                <div className="flex gap-1.5">
                  <button className="btn btn-green btn-sm" onClick={() => givePoints(v.id, v.voter, true)}>+3 pts</button>
                  <button className="btn btn-danger btn-sm" onClick={() => givePoints(v.id, v.voter, false)}>Refuser</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
