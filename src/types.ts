export type User = {
  id: string;
  prenom: string;
  nom: string;
  isAdmin: boolean;
  pwHash?: string;
  pwSalt?: string;
};

export type SafeUser = Pick<User, "id" | "prenom" | "nom" | "isAdmin">;

export type Secret = {
  id: string;
  uid: string;
  text: string;
  createdAt?: unknown;
  found?: boolean;
  foundBy?: string | null;
};

export type Vote = {
  id: string;
  voter: string;
  sid: string;
  secretUid: string;
  guess: string;
  correct?: boolean;
  validated: boolean;
  pointsGiven: boolean;
  adminValidated?: boolean;
  sessId?: string;
  ts?: unknown;
};

export type PointsEntry = { type: "vote" | "defense" | "defi"; pts: number; ts: number };
export type Points = { total: number; history: PointsEntry[] };

export type Session = {
  open: boolean;
  sessId?: string;
  label?: string;
  sessCount?: number;
  openedAt?: unknown;
  closedAt?: unknown;
  krappoSession?: string;
};

export type Defi = {
  id: string;
  assignedTo: string;
  targetVoter: string;
  secretId: string;
  targetAuthor: string;
  status: "pending" | "success" | "failed";
  createdAt?: unknown;
};

export type ToastKind = "ok" | "er" | "nf" | "";

export type View = "home" | "secrets" | "revelations" | "classement" | "defi" | "admin";
