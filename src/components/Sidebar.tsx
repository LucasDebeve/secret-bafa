import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { av, displayName, initial } from "../lib/helpers";
import type { View } from "../types";

const NAV = [
  { key: "home", label: "Tableau de bord", icon: (
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  )},
  { key: "secrets", label: "Les secrets", icon: (
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  )},
  { key: "revelations", label: "Revelations", icon: (
    <g><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></g>
  )},
  { key: "classement", label: "Classement", icon: (
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  )},
  { key: "defi", label: "Mon defi", icon: (
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  )},
] as const;

type Props = {
  view: View;
  onNavigate: (v: View) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ view, onNavigate, isOpen, onClose }: Props) {
  const { me, fid, logout } = useAuth();
  const { formationName } = useData();

  if (!me || !fid) return null;

  const handleNav = (v: View) => {
    onNavigate(v);
    onClose();
  };

  return (
    <aside className={`w-[220px] bg-app-surface border-r border-app-border flex flex-col fixed top-0 left-0 h-screen z-[100] flex-shrink-0 transition-transform duration-200 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-app-border">
        <div className="w-8 h-8 bg-accent rounded-[7px] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">SB</div>
        <div className="text-[15px] font-bold flex-1">Secret BAFA</div>
        <button
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-app-text3 hover:bg-app-bg"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        <div className="text-[11px] font-semibold text-app-text3 tracking-wider px-2 mb-1.5 uppercase">Jeu</div>
        {NAV.filter((n) => me.isAdmin ? n.key !== "defi" : true).map((n) => (
          <button
            key={n.key}
            className={`nav-item ${view === n.key ? "on" : ""}`}
            onClick={() => handleNav(n.key as View)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              {n.icon}
            </svg>
            {n.label}
          </button>
        ))}
        {me.isAdmin && (
          <>
            <div className="text-[11px] font-semibold text-app-text3 tracking-wider px-2 mb-1.5 mt-3.5 uppercase">Animateur</div>
            <button className={`nav-item ${view === "admin" ? "on" : ""}`} onClick={() => handleNav("admin")}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Panel animateur
            </button>
          </>
        )}
      </nav>
      <div className="px-4 py-3.5 border-t border-app-border">
        <div className="text-[10px] font-semibold text-app-text3 tracking-wider uppercase mb-1.5">Formation</div>
        <div className="text-[12px] font-semibold text-app-text mb-2.5 break-words">
          {formationName ? `${formationName} (${fid})` : fid}
        </div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0" style={{ background: av(me.id) }}>
            {initial(me.prenom || me.id)}
          </div>
          <div>
            <div className="text-[13px] font-semibold">{displayName(me)}</div>
            <div className="text-[11px] text-app-text3">{me.isAdmin ? "Animateur" : "Participant"}</div>
          </div>
        </div>
        <a
          href="https://app.krappo.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm w-full mb-2 flex items-center justify-center gap-1.5"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Krappo
        </a>
        <button
          className={`btn btn-ghost btn-sm w-full mb-2 ${view === "profile" ? "on" : ""}`}
          onClick={() => handleNav("profile")}
        >
          Paramètres du profil
        </button>
        <button className="btn btn-ghost btn-sm w-full" onClick={logout}>Se déconnecter</button>
      </div>
    </aside>
  );
}
