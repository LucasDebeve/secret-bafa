import { useState } from "react";
import { deleteDoc, getDocs, setDoc } from "firebase/firestore";
import { fCol, fDoc } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";
import AdminKrappo from "./admin/AdminKrappo";
import AdminSession from "./admin/AdminSession";
import AdminSecrets from "./admin/AdminSecrets";
import AdminVotes from "./admin/AdminVotes";
import AdminDefis from "./admin/AdminDefis";
import AdminUsers from "./admin/AdminUsers";

type Tab = "s" | "v" | "d" | "u";

export default function Admin() {
  const { me, fid } = useAuth();
  const { cS, cV, cP, cU } = useData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("s");

  if (!fid || !me?.isAdmin) return null;

  const totalPts = Object.values(cP).reduce((a, p) => a + (p.total || 0), 0);

  const resetPoints = async () => {
    if (!confirm("Remettre tous les points a zero ?")) return;
    const snap = await getDocs(fCol(fid, "P"));
    await Promise.all(snap.docs.map((d) => setDoc(fDoc(fid, "P", d.id), { total: 0, history: [] })));
    toast("Points a zero.", "nf");
  };

  const resetEverything = async () => {
    if (!confirm("Supprimer TOUT ? Secrets, comptes, votes, points, defis ?")) return;
    if (!confirm("Derniere confirmation — tout sera efface !")) return;
    const [s1, s2, s3, s4, s5] = await Promise.all([
      getDocs(fCol(fid, "S")),
      getDocs(fCol(fid, "V")),
      getDocs(fCol(fid, "P")),
      getDocs(fCol(fid, "U")),
      getDocs(fCol(fid, "D")),
    ]);
    await Promise.all([
      ...s1.docs.map((d) => deleteDoc(fDoc(fid, "S", d.id))),
      ...s2.docs.map((d) => deleteDoc(fDoc(fid, "V", d.id))),
      ...s3.docs.map((d) => deleteDoc(fDoc(fid, "P", d.id))),
      ...s4.docs.filter((d) => !(d.data() as { isAdmin?: boolean }).isAdmin).map((d) => deleteDoc(fDoc(fid, "U", d.id))),
      ...s5.docs.map((d) => deleteDoc(fDoc(fid, "D", d.id))),
    ]);
    await setDoc(fDoc(fid, "SE", "current"), { open: false, sessCount: 0 });
    toast("Tout supprime !", "ok");
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4 md:gap-4 md:mb-5">
        <div className="stat-card"><div className="stat-label">Secrets</div><div className="stat-value">{cS.length}</div></div>
        <div className="stat-card"><div className="stat-label">Joueurs</div><div className="stat-value">{cU.length}</div></div>
        <div className="stat-card"><div className="stat-label">Votes</div><div className="stat-value">{cV.length}</div></div>
        <div className="stat-card"><div className="stat-label">Points attribues</div><div className="stat-value">{totalPts}</div></div>
      </div>

      <AdminKrappo />
      <AdminSession />

      <div className="danger-zone">
        <div className="text-[12px] text-red-800"><strong className="font-semibold">Points</strong> — Remise a zero en fin de sejour</div>
        <button className="btn btn-danger btn-sm" onClick={resetPoints}>Remettre a zero</button>
      </div>
      <div className="danger-zone">
        <div className="text-[12px] text-red-800"><strong className="font-semibold">Fin de jeu</strong> — Supprime tout</div>
        <button className="btn btn-danger btn-sm" onClick={resetEverything}>Tout supprimer</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`filt ${tab === "s" ? "on" : ""}`} onClick={() => setTab("s")}>Secrets</button>
        <button className={`filt ${tab === "v" ? "on" : ""}`} onClick={() => setTab("v")}>Valider votes</button>
        <button className={`filt ${tab === "d" ? "on" : ""}`} onClick={() => setTab("d")}>Defis</button>
        <button className={`filt ${tab === "u" ? "on" : ""}`} onClick={() => setTab("u")}>Joueurs</button>
      </div>

      {tab === "s" && <AdminSecrets />}
      {tab === "v" && <AdminVotes />}
      {tab === "d" && <AdminDefis />}
      {tab === "u" && <AdminUsers />}
    </div>
  );
}
