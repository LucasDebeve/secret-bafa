import { deleteDoc } from "firebase/firestore";
import { fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";

export default function AdminUsers() {
  const { fid } = useAuth();
  const { cU, cP } = useData();
  const toast = useToast();
  if (!fid) return null;

  const del = async (userId: string) => {
    if (!confirm(`Supprimer le compte de ${userId} ?`)) return;
    await deleteDoc(fDoc(fid, "U", userId));
    toast("Compte supprime.", "ok");
  };

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Joueurs</div></div>
      <div className="card-body card-body-tight overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Identifiant</th><th>Prenom</th><th>Nom</th><th>Points</th><th>Action</th></tr></thead>
          <tbody>
            {!cU.length ? (
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
    </div>
  );
}
