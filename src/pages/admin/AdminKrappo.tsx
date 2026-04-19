import { useState } from "react";
import { getDocs, setDoc, updateDoc } from "firebase/firestore";
import { fCol, fDoc } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../contexts/ToastContext";
import { genSalt, hashPassword } from "../../lib/crypto";

export default function AdminKrappo() {
  const { me, fid } = useAuth();
  const { cSess } = useData();
  const toast = useToast();

  const [krSid, setKrSid] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [pw, setPw] = useState("");
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");

  if (!fid || !me?.isAdmin) return null;

  const link = async () => {
    if (!krSid.trim()) return toast("Entre un ID de session.", "er");
    await updateDoc(fDoc(fid, "SE", "current"), { krappoSession: krSid.trim() });
    toast("Session Krappo liee !", "ok");
  };

  const create = async () => {
    setErr("");
    if (!prenom || !nom || !pw) return setErr("Remplis tous les champs.");
    if (pw.length < 6) return setErr("Mot de passe trop court (6 caracteres min).");
    const base = prenom + "." + nom[0].toUpperCase();
    const snap = await getDocs(fCol(fid, "U"));
    const ids = snap.docs.map((d) => (d.data() as { id: string }).id.toLowerCase());
    let id = base, ct = 2;
    while (ids.includes(id.toLowerCase())) { id = base + ct; ct++; }
    const salt = genSalt();
    const pwHash = await hashPassword(pw, salt);
    await setDoc(fDoc(fid, "U", id), { id, prenom, nom, isAdmin: false, pwHash, pwSalt: salt });
    await setDoc(fDoc(fid, "P", id), { total: 0, history: [] });
    setPreview(`Compte cree : ${id}`);
    setPrenom(""); setNom(""); setPw("");
    toast(`Compte ${id} cree !`, "ok");
  };

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Liaison Krappo</div></div>
      <div className="card-body">
        <div className="text-[12px] text-app-text3 mb-3">Lie cette partie a une session Krappo pour importer automatiquement les participants.</div>
        <div className="flex gap-2.5 flex-wrap">
          <input className="inp flex-1 min-w-[180px]" value={krSid} onChange={(e) => setKrSid(e.target.value)} placeholder="ID de session Krappo" />
          <button className="btn" onClick={link}>Lier la session</button>
        </div>
        {cSess.krappoSession && (
          <div className="mt-2.5 text-[12px] text-app-text3">Session Krappo liee : {cSess.krappoSession}</div>
        )}

        <div className="mt-3.5 pt-3.5 border-t border-app-border">
          <div className="text-[12px] font-semibold mb-2.5">Creer des comptes manuellement</div>
          <div className="grid grid-cols-1 gap-3 mb-2.5 sm:grid-cols-2">
            <div>
              <label className="lbl">PRENOM</label>
              <input className="inp" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Adrien" />
            </div>
            <div>
              <label className="lbl">NOM</label>
              <input className="inp" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Martin" />
            </div>
          </div>
          <label className="lbl">MOT DE PASSE</label>
          <input type="password" className="inp mb-2.5" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="min 4 caracteres" />
          <div className="text-[12px] text-app-text3 mb-2">
            {preview || ((prenom || nom) ? `Apercu : ${prenom || "?"}.${nom ? nom[0].toUpperCase() : "?"}` : "")}
          </div>
          {err && <div className="err mb-2">{err}</div>}
          <button className="btn btn-sm" onClick={create}>Creer le compte</button>
        </div>
      </div>
    </div>
  );
}
