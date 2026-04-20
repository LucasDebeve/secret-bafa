import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { av, displayName, initial } from "../lib/helpers";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Faible", "Moyen", "Fort", "Très fort"];
  const colors = ["", "bg-brand-red", "bg-brand-amber", "bg-brand-green", "bg-brand-green"];
  const textColors = ["", "text-brand-red", "text-brand-amber", "text-brand-green", "text-brand-green"];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : "bg-app-border"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function Profile() {
  const { me, updatePassword } = useAuth();
  const toast = useToast();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!me) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPw !== confirmPw) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPw === currentPw) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    setLoading(true);
    const err = await updatePassword(currentPw, newPw);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast("Mot de passe modifié avec succès.", "ok");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Mon profil</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ background: av(me.id) }}
            >
              {initial(me.prenom || me.id)}
            </div>
            <div>
              <div className="text-[16px] font-semibold">{displayName(me)}</div>
              <div className="text-[12px] text-app-text3 mt-0.5">{me.isAdmin ? "Animateur" : "Participant"}</div>
              <div className="text-[11px] text-app-text3 mt-0.5 font-mono">{me.id}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Changer le mot de passe</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="lbl" htmlFor="current-pw">Mot de passe actuel</label>
              <input
                id="current-pw"
                className="inp"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="lbl" htmlFor="new-pw">Nouveau mot de passe</label>
              <input
                id="new-pw"
                className="inp"
                type="password"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={loading}
                required
                minLength={8}
              />
              <PasswordStrength password={newPw} />
            </div>

            <div>
              <label className="lbl" htmlFor="confirm-pw">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm-pw"
                className="inp"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={loading}
                required
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-[11px] text-brand-red mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {error && <div className="err">{error}</div>}

            <button
              type="submit"
              className="btn btn-full"
              disabled={loading || !currentPw || !newPw || !confirmPw}
            >
              {loading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
