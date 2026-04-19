import { deleteDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { fCol, fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";

export default function AdminSession() {
  const { me, fid } = useAuth();
  const { cSess, cV } = useData();
  const toast = useToast();
  if (!fid || !me?.isAdmin) return null;

  const openVotes = async () => {
    if (cSess.open) return toast("Session deja ouverte.", "nf");
    const n = (cSess.sessCount || 0) + 1;
    await setDoc(fDoc(fid, "SE", "current"), {
      open: true,
      sessId: "SESS" + Date.now(),
      label: "Session " + n,
      sessCount: n,
      openedAt: serverTimestamp(),
    });
    toast("Votes ouverts !", "ok");
  };
  const closeVotes = async () => {
    if (!cSess.open) return toast("Aucune session.", "nf");
    await updateDoc(fDoc(fid, "SE", "current"), { open: false, closedAt: serverTimestamp() });
    toast("Votes fermes.", "nf");
  };
  const resetVotes = async () => {
    if (!confirm("Supprimer tous les votes ? (points conserves)")) return;
    const snap = await getDocs(fCol(fid, "V"));
    await Promise.all(snap.docs.map((d) => deleteDoc(fDoc(fid, "V", d.id))));
    await setDoc(fDoc(fid, "SE", "current"), { open: false, sessCount: cSess.sessCount || 0 });
    toast("Votes reinitialises.", "nf");
  };

  const voteCount = cSess.open ? cV.filter((v) => v.sessId === cSess.sessId).length : 0;

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Controle des votes</div></div>
      <div className="card-body">
        <div className="sess-control">
          <div className={`sess-dot ${cSess.open ? "sess-dot-open" : "sess-dot-closed"}`} />
          <div className="flex-1">
            <div className="font-semibold text-[13px]">{cSess.open ? `${cSess.label || "Session"} — ouverte` : "Votes fermes"}</div>
            <div className="text-[12px] text-app-text3">
              {cSess.open ? `${voteCount} vote(s) deposes` : cSess.sessCount ? `Derniere : Session ${cSess.sessCount}` : "Aucune session."}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-green btn-sm" onClick={openVotes}>Ouvrir les votes</button>
          <button className="btn btn-danger btn-sm" onClick={closeVotes}>Fermer les votes</button>
          <button className="btn btn-ghost btn-sm" onClick={resetVotes}>Reinitialiser les votes</button>
        </div>
      </div>
    </div>
  );
}
