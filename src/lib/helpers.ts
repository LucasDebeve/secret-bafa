export const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function av(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}

export function initial(s: string): string {
  return (s || "?")[0]?.toUpperCase() ?? "?";
}

export function displayName(me: { prenom?: string; nom?: string; id: string }): string {
  if (!me.prenom) return me.id;
  return me.prenom + "." + (me.nom ? me.nom[0].toUpperCase() : "");
}
