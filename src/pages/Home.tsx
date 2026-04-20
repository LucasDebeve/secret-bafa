import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { View } from "../types";

export default function Home({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { me } = useAuth();
  const { cS, cV, cP, cD, cU, cSess } = useData();
  if (!me) return null;

  const myPts = cP[me.id]?.total || 0;
  const ranked = Object.entries(cP).filter(([id]) => id !== "admin").sort((a, b) => b[1].total - a[1].total);
  const rank = ranked.findIndex(([id]) => id === me.id);

  const myVote = cV.find((v) => v.voter === me.id && v.sessId === cSess.sessId);
  const votesStatus = cSess.open ? (myVote ? "Vote depose" : "Ouvert") : "Ferme";
  const votesSub = cSess.open
    ? myVote ? "Rendez-vous a la revelation !" : "Tu peux voter maintenant"
    : "L'animateur ouvrira les votes bientot";

  const myDefi = cD.find((d) => d.assignedTo === me.id && d.status === "pending");
  const defiSecret = myDefi ? cS.find((x) => x.id === myDefi.secretId) : undefined;
  const defiSnippet = defiSecret ? `"${defiSecret.text.slice(0, 60)}${defiSecret.text.length > 60 ? "..." : ""}"` : "(secret inconnu)";

  const mySecret = cS.find((s) => s.uid === me.id);
  const myVoteCount = mySecret ? cV.filter((v) => v.sid === mySecret.id).length : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5 md:grid-cols-4 md:gap-4 md:mb-6">
        <div className="stat-card">
          <div className="stat-label">Secrets deposes</div>
          <div className="stat-value">{cS.length}</div>
          <div className="stat-sub">sur {cU.length || "?"} participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Secrets trouves</div>
          <div className="stat-value">{cS.filter((s) => s.found).length}</div>
          <div className="stat-sub">decouverts jusqu'ici</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Mes points</div>
          <div className="stat-value">{myPts}</div>
          <div className="stat-sub">classement : {rank >= 0 ? `#${rank + 1}` : "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Statut des votes</div>
          <div className="stat-value text-base">{votesStatus}</div>
          <div className="stat-sub">{votesSub}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Mon defi secret</div></div>
        <div className="card-body">
          {myDefi ? (
            <div className="defi-highlight">
              <div className="text-[13px] font-bold text-brand-purple mb-1.5 uppercase tracking-wider">Mission active</div>
              <div className="text-[14px] text-app-text leading-relaxed">
                Fais en sorte que <strong className="text-brand-purple">{myDefi.targetVoter}</strong> vote pour <strong className="text-brand-purple">{myDefi.targetAuthor}</strong> sur le secret : <em className="text-app-text2">{defiSnippet}</em>
              </div>
              <div className="mt-2.5"><span className="badge badge-purple">+3 pts si reussi</span></div>
            </div>
          ) : (
            <div className="empty-state"><div className="text-2xl opacity-50 mb-2.5">🎯</div><div className="text-[13px] leading-relaxed">Aucun defi actif pour l'instant.</div></div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Mon secret</div></div>
        <div className="card-body">
          {mySecret ? (
            <div className="secret-card mine" style={{ boxShadow: "none", border: "none", padding: 0 }}>
              <div className="text-[14px] italic text-app-text mb-3">{mySecret.text}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-blue">{myVoteCount} vote{myVoteCount > 1 ? "s" : ""}</span>
                {mySecret.found ? <span className="badge badge-red">Secret trouve !</span> : <span className="badge badge-green">Encore mystere</span>}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "16px" }}>
              <div className="text-[13px]">
                Tu n'as pas encore depose de secret.<br />
                <button className="btn btn-sm mt-2" onClick={() => onNavigate("secrets")}>Deposer mon secret</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
