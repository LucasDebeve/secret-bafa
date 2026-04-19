import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { av, initial } from "../lib/helpers";

export default function Classement() {
  const { me } = useAuth();
  const { cS, cP } = useData();
  if (!me) return null;

  const ids = [...new Set([...Object.keys(cP), ...cS.map((s) => s.uid)])].filter((id) => id !== "admin");
  const ranked = ids
    .map((id) => {
      const p = cP[id];
      return {
        id,
        total: p?.total || 0,
        found: (p?.history || []).filter((h) => h.type === "vote").length,
        defense: (p?.history || []).filter((h) => h.type === "defense").length,
      };
    })
    .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Classement general</div>
        <div className="text-[12px] text-app-text3">+3 pts si secret trouve · +1 pt defense si on se trompe</div>
      </div>
      <div className="card-body card-body-tight">
        {!ranked.length ? (
          <div className="empty-state"><div className="text-2xl opacity-50 mb-2.5">🏆</div><div className="text-[13px]">Aucun participant.</div></div>
        ) : (
          ranked.map((u, i) => (
            <div key={u.id} className="score-row">
              <div className={`w-7 text-center font-bold text-[14px] ${i === 0 ? "text-brand-amber" : i === 1 ? "text-gray-500" : i === 2 ? "text-amber-700" : "text-app-text3"}`}>
                {i < 3 ? medals[i] : i + 1}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] text-white flex-shrink-0" style={{ background: av(u.id) }}>
                {initial(u.id)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[13px]">
                  {u.id}
                  {u.id === me.id && <span className="text-[11px] text-app-text3"> (toi)</span>}
                </div>
                <div className="text-[11px] text-app-text3 mt-0.5">
                  {u.found} trouve{u.found > 1 ? "s" : ""} · {u.defense} defense{u.defense > 1 ? "s" : ""}
                </div>
              </div>
              <div className="font-bold text-[15px] text-accent">{u.total} pts</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
