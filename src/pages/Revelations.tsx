import { useState } from "react";
import { useData } from "../contexts/DataContext";

type Filter = "all" | "found" | "notfound";

export default function Revelations() {
  const { cS } = useData();
  const [filter, setFilter] = useState<Filter>("all");

  const found = cS.filter((s) => s.found);
  const nf = cS.filter((s) => !s.found);
  const toShow = filter === "found" ? found : filter === "notfound" ? nf : cS;

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Revelations <span className="badge badge-gray ml-2">{found.length}/{cS.length}</span></div>
      </div>
      <div className="card-body">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button className={`filt ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>Tous</button>
          <button className={`filt ${filter === "found" ? "on" : ""}`} onClick={() => setFilter("found")}>Trouves</button>
          <button className={`filt ${filter === "notfound" ? "on" : ""}`} onClick={() => setFilter("notfound")}>Pas encore trouves</button>
        </div>
        {!toShow.length ? (
          <div className="empty-state">
            <div className="text-2xl opacity-50 mb-2.5">🔍</div>
            <div className="text-[13px]">{filter === "found" ? "Aucun secret decouvert pour l'instant." : "Tous trouves !"}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {toShow.map((s) => (
              <div key={s.id} className={`secret-card ${s.found ? "found" : ""}`}>
                {s.found ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-brand-green-bg border border-brand-green-border rounded-lg mb-2.5 text-[12px] text-emerald-800">
                    Auteur : <span className="font-bold">{s.uid}</span> — decouvert par {s.foundBy || "?"}
                  </div>
                ) : (
                  <div className="px-2.5 py-1.5 bg-app-bg rounded-md mb-2.5 text-[11px] text-app-text3">PAS ENCORE TROUVE — auteur : ???</div>
                )}
                <div className="text-[14px] italic text-app-text mb-3">"{s.text}"</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-app-text3 font-medium font-mono">#{s.id.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
