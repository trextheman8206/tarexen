import Link from "next/link";
import { notFound } from "next/navigation";
import { platformName, REC_AREAS, SITE } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { checklistScore, pct, visibilityStats } from "@/lib/report";
import { getAudit, getBusiness, listChecklist, listChecks, listQueries, listRecommendations } from "@/lib/repo";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Informe" };

const L = {
  es: {
    title: { snapshot: "Snapshot de visibilidad en IA", full: "Auditoría de visibilidad en IA", followup: "Informe de seguimiento" },
    prepared: "Preparado por TAREXEN AI Visibility", date: "Fecha", location: "Ubicación", category: "Categoría",
    summary: "Resumen", visibility: "Visibilidad en respuestas de IA y búsqueda", appeared: "Consultas donde aparece el negocio",
    platform: "Plataforma", queries: "Consultas", appears: "Aparece", partial: "Parcial",
    detail: "Detalle de consultas", question: "Pregunta", result: "Resultado", when: "Fecha y hora", method: "Método",
    yes: "Sí", no: "No", partialLbl: "Parcial", manual: "Manual", api: "API",
    competitors: "Competidores mencionados", mention: "mención", mentions: "menciones", noCompetitors: "No se registraron competidores.",
    checklist: "Revisión de presencia pública", score: "Puntaje", evaluated: "puntos evaluados",
    res: { cumple: "Cumple", parcial: "Parcial", no_cumple: "No cumple", desconocido: "Sin evaluar" },
    recs: "Recomendaciones", priority: "Prioridad", basis: "Base", finding: "Hallazgo", assumption: "Supuesto",
    pr: { alta: "Alta", media: "Media", baja: "Baja" },
    compare: "Comparación con la medición anterior", before: "Antes", after: "Ahora",
    method_note: "Metodología: las consultas marcadas como “Manual” fueron escritas por una persona en la plataforma indicada, desde una sesión sin historial, en la fecha y hora registradas. Las respuestas de los asistentes de IA cambian con el tiempo y entre usuarios; este informe describe lo observado en esas consultas, no una posición permanente.",
    disclaimer: "TAREXEN no garantiza posiciones, recomendaciones, clientes ni ventas. No escribimos ni compramos reseñas. ChatGPT, Gemini, Claude y Google son marcas de sus dueños; TAREXEN no está afiliado a ellos.",
    none: "Sin consultas registradas todavía.",
  },
  en: {
    title: { snapshot: "AI visibility snapshot", full: "AI visibility audit", followup: "Follow-up report" },
    prepared: "Prepared by TAREXEN AI Visibility", date: "Date", location: "Location", category: "Category",
    summary: "Summary", visibility: "Visibility in AI and search answers", appeared: "Queries where the business appears",
    platform: "Platform", queries: "Queries", appears: "Appears", partial: "Partial",
    detail: "Query detail", question: "Question", result: "Result", when: "Date and time", method: "Method",
    yes: "Yes", no: "No", partialLbl: "Partial", manual: "Manual", api: "API",
    competitors: "Competitors mentioned", mention: "mention", mentions: "mentions", noCompetitors: "No competitors were recorded.",
    checklist: "Public presence review", score: "Score", evaluated: "items evaluated",
    res: { cumple: "Meets", parcial: "Partial", no_cumple: "Does not meet", desconocido: "Not evaluated" },
    recs: "Recommendations", priority: "Priority", basis: "Basis", finding: "Finding", assumption: "Assumption",
    pr: { alta: "High", media: "Medium", baja: "Low" },
    compare: "Comparison with previous measurement", before: "Before", after: "Now",
    method_note: "Methodology: queries marked “Manual” were typed by a person into the stated platform, from a session without history, at the recorded date and time. AI assistant answers change over time and between users; this report describes what was observed in those queries, not a permanent position.",
    disclaimer: "TAREXEN does not guarantee rankings, recommendations, customers or sales. We never write or buy reviews. ChatGPT, Gemini, Claude and Google are trademarks of their owners; TAREXEN is not affiliated with them.",
    none: "No queries recorded yet.",
  },
} as const;

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const audit = await getAudit(Number(id));
  if (!audit) notFound();
  const biz = await getBusiness(audit.business_id);
  if (!biz) notFound();
  const lang = sp.lang === "en" || sp.lang === "es" ? sp.lang : audit.report_lang;
  const t = L[lang];

  const [queries, items, checks, recs, parentQueries] = await Promise.all([
    listQueries(audit.id),
    listChecklist(biz.category_id),
    listChecks(audit.id),
    listRecommendations(audit.id),
    audit.parent_audit_id ? listQueries(audit.parent_audit_id) : Promise.resolve([]),
  ]);
  const stats = visibilityStats(queries);
  const prev = parentQueries.length ? visibilityStats(parentQueries) : null;
  const score = checklistScore(items, checks);
  const checkByItem = new Map(checks.map((c) => [c.checklist_item_id, c]));
  const appearedLbl = { si: t.yes, no: t.no, parcial: t.partialLbl } as const;
  const location = [biz.parish_name ?? biz.parish_text, biz.canton_name, biz.province_name].filter(Boolean).join(", ");
  const label = (x: { label_es: string; label_en: string }) => (lang === "en" ? x.label_en : x.label_es);

  return (
    <>
      <div className="report-toolbar">
        <Link className="btn btn-ghost btn-sm" href={`/admin/auditorias/${audit.id}`}>← Volver</Link>
        <PrintButton />
        <Link className="btn btn-ghost btn-sm" href={`?lang=${lang === "es" ? "en" : "es"}`}>{lang === "es" ? "English" : "Español"}</Link>
        {biz.is_demo ? <span className="badge badge-warn">DEMO — datos ficticios</span> : null}
      </div>
      <article className="report" lang={lang}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="logo"><span className="logo-mark" aria-hidden="true">✦</span> TAREXEN <small>AI Visibility</small></div>
          <div className="small muted">{t.date}: {(audit.completed_at ?? audit.created_at).slice(0, 10)} · #{audit.id}</div>
        </div>
        <h1 style={{ marginTop: 24 }}>{t.title[audit.kind]}</h1>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{biz.name}</p>
        <p className="muted">{t.category}: {(lang === "en" ? biz.category_name_en : biz.category_name) ?? "—"} · {t.location}: {location}</p>

        {audit.summary && (<><h2>{t.summary}</h2><p className="pre">{audit.summary}</p></>)}

        <h2>{t.visibility}</h2>
        {stats.total === 0 ? <p className="muted">{t.none}</p> : (
          <>
            <p style={{ fontSize: "1.1rem" }}><b>{stats.yes}/{stats.total}</b> {t.appeared.toLowerCase()} ({pct(stats.rate)}){stats.partial ? ` · ${stats.partial} ${t.partial.toLowerCase()}` : ""}</p>
            <div className="meter" aria-hidden="true"><i style={{ width: pct(stats.rate) }} /></div>
            <table style={{ marginTop: 14 }}>
              <thead><tr><th>{t.platform}</th><th>{t.queries}</th><th>{t.appears}</th><th>{t.partial}</th></tr></thead>
              <tbody>
                {[...stats.byPlatform.entries()].map(([p, s]) => (
                  <tr key={p}><td>{platformName(p)}</td><td>{s.total}</td><td>{s.yes}</td><td>{s.partial}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {prev && (
          <>
            <h2>{t.compare}</h2>
            <table>
              <thead><tr><th></th><th>{t.before}</th><th>{t.after}</th></tr></thead>
              <tbody>
                <tr><td>{t.appeared}</td><td>{prev.yes}/{prev.total} ({pct(prev.rate)})</td><td>{stats.yes}/{stats.total} ({pct(stats.rate)})</td></tr>
              </tbody>
            </table>
          </>
        )}

        <h2>{t.competitors}</h2>
        {stats.competitors.length === 0 ? <p className="muted">{t.noCompetitors}</p> : (
          <ol>{stats.competitors.slice(0, 10).map(([name, n]) => <li key={name}>{name} — {n} {n === 1 ? t.mention : t.mentions}</li>)}</ol>
        )}

        {queries.length > 0 && (
          <>
            <h2>{t.detail}</h2>
            <table>
              <thead><tr><th>{t.question}</th><th>{t.platform}</th><th>{t.result}</th><th>{t.when}</th></tr></thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id}>
                    <td>{q.question}{q.sources_cited ? <div className="small muted pre">{q.sources_cited}</div> : null}</td>
                    <td>{platformName(q.platform)}<div className="small muted">{q.method === "manual" ? t.manual : t.api}</div></td>
                    <td>{appearedLbl[q.appeared]}{q.position ? ` (#${q.position})` : ""}</td>
                    <td className="small">{q.tested_at.replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2>{t.checklist}</h2>
        <p>{t.score}: <b>{score.score === null ? "—" : `${score.score}/100`}</b> <span className="muted small">({score.evaluated}/{score.total} {t.evaluated})</span></p>
        <table>
          <tbody>
            {items.filter((it) => checkByItem.get(it.id) && checkByItem.get(it.id)!.result !== "desconocido").map((it) => {
              const c = checkByItem.get(it.id)!;
              return (
                <tr key={it.id}>
                  <td>{label(it)}{c.evidence ? <div className="small muted">{c.evidence}</div> : null}</td>
                  <td style={{ whiteSpace: "nowrap" }}><span className={`badge ${c.result === "cumple" ? "badge-ok" : c.result === "parcial" ? "badge-warn" : "badge-danger"}`}>{t.res[c.result]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {recs.length > 0 && (
          <>
            <h2>{t.recs}</h2>
            {recs.map((r, i) => (
              <div key={r.id} className="card" style={{ marginBottom: 10, boxShadow: "none" }}>
                <div className="small muted">
                  {i + 1}. {REC_AREAS.find((a) => a.id === r.area)?.[lang] ?? r.area} · {t.priority}: {t.pr[r.priority]} · {t.basis}: {r.basis === "hallazgo" ? t.finding : t.assumption}{r.basis_ref ? ` (${r.basis_ref})` : ""}
                </div>
                <p className="pre" style={{ margin: "6px 0 0" }}>{r.text}</p>
              </div>
            ))}
          </>
        )}

        <hr style={{ margin: "32px 0 16px", border: 0, borderTop: "1px solid var(--line)" }} />
        <p className="small muted">{t.method_note}</p>
        <p className="small muted">{t.disclaimer}</p>
        <p className="small muted">{t.prepared}{SITE.email ? ` · ${SITE.email}` : ""}</p>
      </article>
    </>
  );
}
