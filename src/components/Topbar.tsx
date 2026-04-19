import { useData } from "../contexts/DataContext";
import type { View } from "../types";

const TITLES: Record<View, string> = {
  home: "Tableau de bord",
  secrets: "Les secrets",
  revelations: "Revelations",
  classement: "Classement",
  defi: "Mon defi",
  admin: "Panel animateur",
};

type Props = {
  view: View;
  onMenuToggle: () => void;
};

export default function Topbar({ view, onMenuToggle }: Props) {
  const { cSess } = useData();
  return (
    <div className="h-14 bg-app-surface border-b border-app-border flex items-center px-4 md:px-7 gap-3 sticky top-0 z-50">
      <button
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-app-text2 hover:bg-app-bg flex-shrink-0"
        onClick={onMenuToggle}
        aria-label="Ouvrir le menu"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <div className="text-base font-bold">{TITLES[view]}</div>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        {cSess.open ? (
          <span className="badge badge-green">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulseDot" />
            <span className="hidden sm:inline">Votes ouverts</span>
            <span className="sm:hidden">Ouverts</span>
          </span>
        ) : (
          <span className="badge badge-gray hidden sm:inline-flex">Votes fermes</span>
        )}
      </div>
    </div>
  );
}
