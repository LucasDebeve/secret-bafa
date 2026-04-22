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
      const sRef = fDoc(fid, "S", v.sid);
      const sSnap = await getDoc(sRef);
      const alreadyFound = sSnap.exists() && sSnap.data().found;
      if (!alreadyFound) {
        const pRef = fDoc(fid, "P", voter);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          await updateDoc(pRef, { total: increment(3), history: [...(pSnap.data().history || []), { type: "vote", pts: 3, ts: Date.now() }] });
        } else {
          await setDoc(pRef, { total: 3, history: [{ type: "vote", pts: 3, ts: Date.now() }] });
        }
        if (sSnap.exists()) {
          await updateDoc(sRef, { found: true, foundBy: voter });
        }
        toast(`+3 pts pour ${voter} (premier trouveur !)`, "ok");
      } else {
        toast(`Correct mais secret deja trouve — 0 pt pour ${voter}.`, "nf");
      }
    } else {
      const pRef = fDoc(fid, "P", v.secretUid);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        await updateDoc(pRef, { total: increment(1), history: [...(pSnap.data().history || []), { type: "defense", pts: 1, ts: Date.now() }] });
      } else {
        await setDoc(pRef, { total: 1, history: [{ type: "defense", pts: 1, ts: Date.now() }] });
      }
      toast(`Refuse — +1 pt defense pour ${v.secretUid}.`, "nf");
    }
  };

  const formatTime = (ts: unknown): string => {
    if (!ts || typeof ts !== "object") return "—";
    const t = ts as Record<string, unknown>;
    let ms = 0;
    if (typeof t.seconds === "number") ms = t.seconds * 1000;
    else if (typeof t.toMillis === "function") ms = (t.toMillis as () => number)();
    else return "—";
    return new Date(ms).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const toSeconds = (ts: unknown): number => {
    if (!ts || typeof ts !== "object") return 0;
    const t = ts as Record<string, unknown>;
    if (typeof t.seconds === "number") return t.seconds;
    if (typeof t.toMillis === "function") return (t.toMillis as () => number)() / 1000;
    return 0;
  };
  const sorted = [...cV].sort((a, b) => toSeconds(a.ts) - toSeconds(b.ts));
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
        <span className="badge badge-blue hidden sm:inline-flex">+3 pts au 1er trouveur · +1 pt a la cible d'un mauvais vote</span>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block card-body card-body-tight overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Heure</th><th>Votant</th><th>Secret</th><th>A devine</th><th>Vrai auteur</th><th>Statut</th><th>Action</th></tr></thead>
          <tbody>
            {empty ? (
              <tr><td colSpan={7} className="text-center py-6 text-app-text3">Aucun vote.</td></tr>
            ) : sorted.map((v) => {
              const s = cS.find((x) => x.id === v.sid);
              return (
                <tr key={v.id} style={v.validated ? { opacity: 0.55 } : undefined}>
                  <td><span className="font-mono text-[11px] text-app-text3">{formatTime(v.ts)}</span></td>
                  <td><span className="font-semibold text-accent text-[12px]">{v.voter}</span></td>
                  <td className="italic text-app-text2">{s ? s.text : <em className="opacity-50">supprime</em>}</td>
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-app-text3">{formatTime(v.ts)}</span>
                  <span className="font-semibold text-accent text-[13px]">{v.voter}</span>
                </div>
                <StatusBadge v={v} />
              </div>
              <div className="text-[12px] text-app-text3 mb-0.5">
                A devine <strong className="text-brand-purple">{v.guess}</strong> · vrai auteur : <strong className="text-accent">{v.secretUid || "?"}</strong>
              </div>
              {s && (
                <div className="text-[12px] italic text-app-text2 mb-2.5">
                  "{s.text}"
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
