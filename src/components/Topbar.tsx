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

export default function Topbar({ view }: { view: View }) {
  const { cSess } = useData();
  return (
    <div className="h-14 bg-app-surface border-b border-app-border flex items-center px-7 gap-4 sticky top-0 z-50">
      <div>
        <div className="text-base font-bold">{TITLES[view]}</div>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        {cSess.open ? (
          <span className="badge badge-green">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulseDot" />
            Votes ouverts
          </span>
        ) : (
          <span className="badge badge-gray">Votes fermes</span>
        )}
      </div>
    </div>
  );
}
