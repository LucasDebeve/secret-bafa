import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ToastProvider } from "./contexts/ToastContext";
import Auth from "./pages/Auth";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";
import Secrets from "./pages/Secrets";
import Revelations from "./pages/Revelations";
import Classement from "./pages/Classement";
import Defi from "./pages/Defi";
import Admin from "./pages/Admin";
import type { View } from "./types";

function Shell() {
  const { me, fid } = useAuth();
  const [view, setView] = useState<View>("home");

  if (!me || !fid) return <Auth />;

  return (
    <div className="min-h-screen flex">
      <Sidebar view={view} onNavigate={setView} />
      <main className="ml-[220px] flex-1 min-h-screen">
        <Topbar view={view} />
        <div className="p-7 max-md:p-4">
          {view === "home" && <Home onNavigate={setView} />}
          {view === "secrets" && <Secrets />}
          {view === "revelations" && <Revelations />}
          {view === "classement" && <Classement />}
          {view === "defi" && <Defi />}
          {view === "admin" && <Admin />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
