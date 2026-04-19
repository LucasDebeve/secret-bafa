import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

type Mode = "join" | "create";

export default function Auth() {
  const { login, createFormation } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("join");

  const [lf, setLf] = useState("");
  const [li, setLi] = useState("");
  const [lp, setLp] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [pw, setPw] = useState("");
  const [createErr, setCreateErr] = useState("");
  const [creating, setCreating] = useState(false);

  const onLogin = async () => {
    const remaining = cooldownUntil - Date.now();
    if (remaining > 0) {
      setLoginErr(`Trop de tentatives. Attends ${Math.ceil(remaining / 1000)}s.`);
      return;
    }
    setLoginErr("");
    setLoggingIn(true);
    const err = await login(lf, li, lp);
    setLoggingIn(false);
    if (err) {
      const next = failCount + 1;
      setFailCount(next);
      if (next >= 3) setCooldownUntil(Date.now() + 15_000);
      setLoginErr(err);
    } else {
      setFailCount(0);
      setCooldownUntil(0);
    }
  };

  const onCreate = async () => {
    setCreateErr("");
    setCreating(true);
    const err = await createFormation({ code, name, prenom, nom, pw });
    setCreating(false);
    if (err) setCreateErr(err);
    else toast("Formation creee !", "ok");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app-bg p-8">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">SB</div>
          <div className="text-base font-bold text-app-text">Secret BAFA</div>
        </div>
        <div className="bg-app-surface border border-app-border rounded-xl p-8">
          <div className="tabs">
            <button className={`tab ${mode === "join" ? "on" : ""}`} onClick={() => setMode("join")}>Rejoindre</button>
            <button className={`tab ${mode === "create" ? "on" : ""}`} onClick={() => setMode("create")}>Creer formation</button>
          </div>

          {mode === "join" ? (
            <div>
              <div className="text-xl font-bold mb-1">Connexion</div>
              <div className="text-[13px] text-app-text3 mb-6">Rejoins une session de formation existante</div>
              <label className="lbl">CODE DE FORMATION</label>
              <input className="inp" value={lf} onChange={(e) => setLf(e.target.value)} placeholder="BAFA-ETE-2024" autoComplete="off" />
              <label className="lbl">IDENTIFIANT</label>
              <input className="inp" value={li} onChange={(e) => setLi(e.target.value)} placeholder="Prenom.Initiale" autoComplete="off" />
              <label className="lbl">MOT DE PASSE</label>
              <input type="password" className="inp" value={lp} onChange={(e) => setLp(e.target.value)} placeholder="••••••••" />
              {loginErr && <div className="err">{loginErr}</div>}
              <button className="btn btn-full" disabled={loggingIn || Date.now() < cooldownUntil} onClick={onLogin}>
                {loggingIn ? "Connexion..." : "Se connecter"}
              </button>
              <div className="mt-3.5 pt-3.5 border-t border-app-border text-[12px] text-app-text3">
                Ton compte est cree par l'animateur. Demande-lui le code de formation et tes identifiants.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl font-bold mb-1">Creer une formation</div>
              <div className="text-[13px] text-app-text3 mb-6">Initialise une nouvelle session de formation (animateur)</div>
              <label className="lbl">CODE DE FORMATION</label>
              <input className="inp" value={code} onChange={(e) => setCode(e.target.value)} placeholder="BAFA-ETE-2024" autoComplete="off" />
              <label className="lbl">NOM DE LA FORMATION</label>
              <input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="BAFA Ete 2024" autoComplete="off" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl">PRENOM ANIMATEUR</label>
                  <input className="inp" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Adrien" />
                </div>
                <div>
                  <label className="lbl">NOM ANIMATEUR</label>
                  <input className="inp" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Martin" />
                </div>
              </div>
              <label className="lbl">MOT DE PASSE ANIMATEUR</label>
              <input type="password" className="inp" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="min 6 caracteres" />
              {createErr && <div className="err">{createErr}</div>}
              <button className="btn btn-full" disabled={creating} onClick={onCreate}>
                {creating ? "Creation..." : "Creer et se connecter"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
