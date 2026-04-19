import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  pending: { cls: "badge-purple", label: "En cours" },
  success: { cls: "badge-green", label: "Reussi +3 pts" },
  failed: { cls: "badge-red", label: "Echoue" },
};

export default function Defi() {
  const { me } = useAuth();
  const { cS, cD } = useData();
  if (!me) return null;

  const myD = cD.filter((d) => d.assignedTo === me.id);

  if (!myD.length) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div className="text-2xl opacity-50 mb-2.5">🎯</div>
            <div className="text-[13px]">
              Aucun defi pour l'instant.<br />
              L'animateur va bientot t'en attribuer un !
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {myD.map((d) => {
        const s = cS.find((x) => x.id === d.secretId);
        const snippet = s ? `"${s.text.slice(0, 80)}${s.text.length > 80 ? "..." : ""}"` : "(secret inconnu)";
        const st = STATUS_BADGE[d.status || "pending"];
        return (
          <div key={d.id} className="card">
            <div className="card-head">
              <div className="card-title">Defi secret</div>
              <span className={`badge ${st.cls}`}>{st.label}</span>
            </div>
            <div className="card-body">
              <div className="defi-highlight">
                <div className="text-[13px] font-bold text-brand-purple mb-1.5 uppercase tracking-wider">Ta mission</div>
                <div className="text-[14px] text-app-text leading-relaxed">
                  Fais en sorte que <strong className="text-brand-purple">{d.targetVoter}</strong> vote pour <strong className="text-brand-purple">{d.targetAuthor}</strong> sur le secret :<br />
                  <em className="text-app-text2 text-[13px]">{snippet}</em>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap"><span className="badge badge-purple">+3 pts si reussi</span></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
