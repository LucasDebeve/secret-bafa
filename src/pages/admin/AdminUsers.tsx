import { deleteDoc } from "firebase/firestore";
import { fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";
import { av, initial } from "../../lib/helpers";

export default function AdminUsers() {
  const { me, fid } = useAuth();
  const { cU, cP } = useData();
  const toast = useToast();
  if (!fid || !me?.isAdmin) return null;

  const del = async (userId: string) => {
    if (!confirm(`Supprimer le compte de ${userId} ?`)) return;
    await deleteDoc(fDoc(fid, "U", userId));
    toast("Compte supprime.", "ok");
  };

  const empty = !cU.length;

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Joueurs</div></div>

      {/* Table — desktop */}
      <div className="hidden md:block card-body card-body-tight overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Identifiant</th><th>Prenom</th><th>Nom</th><th>Points</th><th>Action</th></tr></thead>
          <tbody>
            {empty ? (
              <tr><td colSpan={5} className="text-center py-6 text-app-text3">Aucun joueur.</td></tr>
            ) : cU.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.id}</strong></td>
                <td>{u.prenom || "—"}</td>
                <td>{u.nom || "—"}</td>
                <td><strong className="text-accent">{cP[u.id]?.total || 0} pts</strong></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartes — mobile */}
      <div className="md:hidden">
        {empty ? (
          <div className="empty-state">Aucun joueur.</div>
        ) : cU.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-app-border last:border-b-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0" style={{ background: av(u.id) }}>
              {initial(u.prenom || u.id)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px] truncate">{u.id}</div>
              <div className="text-[11px] text-app-text3">{[u.prenom, u.nom].filter(Boolean).join(" ") || "—"}</div>
            </div>
            <strong className="text-accent text-[14px] flex-shrink-0">{cP[u.id]?.total || 0} pts</strong>
            <button className="btn btn-danger btn-sm flex-shrink-0" onClick={() => del(u.id)}>Suppr.</button>
          </div>
        ))}
      </div>
    </div>
  );
}
