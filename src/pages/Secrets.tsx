import { useMemo, useState } from "react";
import { addDoc, getDoc, serverTimestamp, setDoc, updateDoc, increment } from "firebase/firestore";
import { fCol, fDoc } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";

export default function Secrets() {
  const { me, fid } = useAuth();
  const { cS, cV, cSess, cD } = useData();
  const toast = useToast();
  const [txt, setTxt] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const myVote = useMemo(
    () => (cSess.sessId ? cV.find((v) => v.voter === me!.id && v.sessId === cSess.sessId) : undefined),
    [cV, cSess.sessId, me]
  );
  const voteCount = useMemo(() => {
    const out: Record<string, number> = {};
    cV.forEach((v) => { out[v.sid] = (out[v.sid] || 0) + 1; });
    return out;
  }, [cV]);
  const foundUids = useMemo(() => new Set(cS.filter((s) => s.found).map((s) => s.uid)), [cS]);
  const otherAuthors = useMemo(
    () => [...new Set(cS.map((s) => s.uid))].filter((u) => u !== me!.id && !foundUids.has(u)),
    [cS, foundUids, me]
  );

  if (!me || !fid) return null;

  const submit = async () => {
    setErr("");
    const text = txt.trim();
    if (!text) return setErr("Ecris quelque chose.");
    if (text.length < 5) return setErr("Secret trop court.");
    if (cS.find((s) => s.uid === me.id)) return setErr("Tu as deja un secret.");
    setBusy(true);
    try {
      await addDoc(fCol(fid, "S"), { uid: me.id, text, createdAt: serverTimestamp() });
      setTxt("");
      toast("Secret confie !", "ok");
    } catch (e) {
      console.error(e);
      setErr("Erreur.");
    } finally {
      setBusy(false);
    }
  };

  const submitVote = async (sid: string) => {
    if (!cSess.open) return toast("Votes fermes.", "er");
    const guessed = picks[sid];
    if (!guessed) return toast("Choisis un auteur !", "er");
    const s = cS.find((x) => x.id === sid);
    if (!s || s.uid === me.id) return toast("Pas ton propre secret !", "er");
    if (cV.find((v) => v.voter === me.id && v.sessId === cSess.sessId)) return toast("Tu as deja vote !", "er");
    const correct = guessed === s.uid;
    try {
      await addDoc(fCol(fid, "V"), {
        voter: me.id,
        sid,
        secretUid: s.uid,
        guess: guessed,
        correct,
        validated: false,
        pointsGiven: false,
        sessId: cSess.sessId,
        ts: serverTimestamp(),
      });
      if (!correct) {
        const pRef = fDoc(fid, "P", s.uid);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          await updateDoc(pRef, { total: increment(1), history: [...(pSnap.data().history || []), { type: "defense", pts: 1, ts: Date.now() }] });
        } else {
          await setDoc(pRef, { total: 1, history: [{ type: "defense", pts: 1, ts: Date.now() }] });
        }
      }
      for (const d of cD) {
        if (d.status === "pending" && d.targetVoter === me.id && d.secretId === sid && d.targetAuthor === guessed) {
          await updateDoc(fDoc(fid, "D", d.id), { status: "success" });
          const pRef = fDoc(fid, "P", d.assignedTo);
          const pSnap = await getDoc(pRef);
          if (pSnap.exists()) {
            await updateDoc(pRef, { total: increment(3), history: [...(pSnap.data().history || []), { type: "defi", pts: 3, ts: Date.now() }] });
          } else {
            await setDoc(pRef, { total: 3, history: [{ type: "defi", pts: 3, ts: Date.now() }] });
          }
          toast(`Defi reussi par ${d.assignedTo} ! +3 pts`, "ok");
        }
      }
      toast("Vote enregistre !", "nf");
    } catch (e) {
      console.error(e);
      toast("Erreur.", "er");
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-head"><div className="card-title">Deposer mon secret</div></div>
        <div className="card-body">
          <textarea
            className="inp min-h-[90px] resize-y leading-relaxed"
            placeholder="Ce que tu n'as jamais ose dire..."
            maxLength={300}
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
          />
          <div className="flex justify-between items-center mt-1.5">
            {err && <div className="err">{err}</div>}
            <div className="text-[11px] text-app-text3 ml-auto">{txt.length}/300</div>
          </div>
          <button className="btn mt-3" disabled={busy} onClick={submit}>{busy ? "Envoi..." : "Confier mon secret"}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Les secrets <span className="badge badge-gray ml-2">{cS.length}</span></div>
        </div>
        <div className="card-body">
          <div className="mb-4">
            {cSess.open ? (
              myVote
                ? <div className="sess-banner sess-banner-closed">Vote envoye ! Rendez-vous a la revelation.</div>
                : <div className="sess-banner sess-banner-open"><strong>Votes ouverts !</strong>&nbsp;Un seul vote par session — choisis bien.</div>
            ) : (
              <div className="sess-banner sess-banner-wait">Pas de session ouverte. L'animateur ouvrira les votes bientot.</div>
            )}
          </div>

          {!cS.length ? (
            <div className="empty-state"><div className="text-2xl opacity-50 mb-2.5">🤐</div><div className="text-[13px]">Aucun secret pour l'instant.</div></div>
          ) : (
            <div className="flex flex-col gap-3">
              {cS.map((s) => {
                const isOwn = s.uid === me.id;
                const vc = voteCount[s.id] || 0;
                const myVoteOn = cV.find((v) => v.voter === me.id && v.sid === s.id);
                const canVote = cSess.open && !isOwn && !myVote;
                return (
                  <div key={s.id} className={`secret-card ${isOwn ? "mine" : ""} ${myVoteOn ? "voted" : ""} ${s.found ? "found" : ""}`}>
                    {s.found && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-brand-green-bg border border-brand-green-border rounded-lg mb-2.5 text-[12px] text-emerald-800 flex-wrap">
                        Secret decouvert — <span className="font-bold">{s.uid}</span> <span className="font-normal">trouve par {s.foundBy || "?"}</span>
                      </div>
                    )}
                    <div className="text-[14px] italic text-app-text mb-3">"{s.text}"</div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-app-text3 font-medium font-mono">#{s.id.slice(-6)}</span>
                        {isOwn ? <span className="badge badge-blue">Ton secret</span> : <span className="badge badge-gray">auteur : ???</span>}
                        {myVoteOn && <span className="badge badge-purple">Ton vote</span>}
                        <span className="badge badge-gray">{vc} vote{vc > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isOwn ? (
                          <span className="text-[12px] text-app-text3">Ton secret</span>
                        ) : myVoteOn ? (
                          <span className="text-[12px] text-app-text3">Vote envoye</span>
                        ) : canVote ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              className="inp !w-auto !py-[7px] !px-2.5 !text-[12px] !rounded-md"
                              value={picks[s.id] || ""}
                              onChange={(e) => setPicks((p) => ({ ...p, [s.id]: e.target.value }))}
                            >
                              <option value="">Qui est l'auteur ?</option>
                              {otherAuthors.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button className="btn btn-sm" onClick={() => submitVote(s.id)}>Voter</button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-app-text3">{cSess.open ? "Deja vote" : "Votes fermes"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
