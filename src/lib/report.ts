import type { AuditCheck, AuditQuery, ChecklistItem } from "./repo";

/** Divide un campo de texto "uno por línea / separado por comas" en nombres limpios. */
export function splitNames(s: string): string[] {
  return s.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);
}

export function visibilityStats(queries: AuditQuery[]) {
  const total = queries.length;
  const yes = queries.filter((q) => q.appeared === "si").length;
  const partial = queries.filter((q) => q.appeared === "parcial").length;
  const byPlatform = new Map<string, { total: number; yes: number; partial: number }>();
  for (const q of queries) {
    const p = byPlatform.get(q.platform) ?? { total: 0, yes: 0, partial: 0 };
    p.total++;
    if (q.appeared === "si") p.yes++;
    if (q.appeared === "parcial") p.partial++;
    byPlatform.set(q.platform, p);
  }
  const competitorCounts = new Map<string, number>();
  for (const q of queries) {
    // Contar cada competidor una vez por consulta.
    for (const name of new Set(splitNames(q.competitors))) {
      competitorCounts.set(name, (competitorCounts.get(name) ?? 0) + 1);
    }
  }
  const competitors = [...competitorCounts.entries()].sort((a, b) => b[1] - a[1]);
  return { total, yes, partial, rate: total ? yes / total : 0, byPlatform, competitors };
}

const SCORE: Record<string, number | null> = { cumple: 1, parcial: 0.5, no_cumple: 0, desconocido: null };

/** Puntaje ponderado del checklist (0–100). Los "desconocido" no cuentan. */
export function checklistScore(items: ChecklistItem[], checks: AuditCheck[]) {
  const byItem = new Map(checks.map((c) => [c.checklist_item_id, c]));
  let earned = 0;
  let possible = 0;
  let evaluated = 0;
  for (const it of items) {
    const c = byItem.get(it.id);
    const s = c ? SCORE[c.result] : null;
    if (s === null || s === undefined) continue;
    evaluated++;
    possible += it.weight;
    earned += it.weight * s;
  }
  return { score: possible ? Math.round((earned / possible) * 100) : null, evaluated, total: items.length };
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;
