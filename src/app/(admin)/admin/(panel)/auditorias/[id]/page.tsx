import { adminT, adminTitle } from "@/lib/admin-i18n";
import Link from "next/link";
import { notFound } from "next/navigation";
import { platformName, PLATFORMS, REC_AREAS } from "@/config/site";
import { requirePerm } from "@/lib/auth";
import { checklistScore, pct, visibilityStats } from "@/lib/report";
import { getAudit, getBusiness, listChecklist, listChecks, listQueries, listQuestions, listRecommendations } from "@/lib/repo";
import {
  addQueryAction, addRecommendationAction, createFollowupAction, deleteQueryAction, deleteRecommendationAction,
  saveChecksAction, updateAuditAction,
} from "../../../actions";
import { AppearedBadge, KIND_LABEL, StatusBadge } from "../../ui";

export async function generateMetadata() {
  return adminTitle("Auditoría");
}

/** Hora actual de Ecuador continental (UTC-5, sin horario de verano). */
const nowEcuador = () => new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 16);

export default async function AuditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ retest?: string }> }) {
  const T = await adminT();
  await requirePerm("audits.edit");
  const { id } = await params;
  const sp = await searchParams;
  const audit = await getAudit(Number(id));
  if (!audit) notFound();
  const biz = await getBusiness(audit.business_id);
  if (!biz) notFound();

  const [queries, items, checks, recs, questions, parentQueries] = await Promise.all([
    listQueries(audit.id),
    listChecklist(biz.category_id),
    listChecks(audit.id),
    listRecommendations(audit.id),
    biz.category_id ? listQuestions(biz.category_id) : Promise.resolve([]),
    audit.parent_audit_id ? listQueries(audit.parent_audit_id) : Promise.resolve([]),
  ]);

  const retestSource = sp.retest ? [...queries, ...parentQueries].find((q) => q.id === Number(sp.retest)) : undefined;
  const city = biz.canton_name ?? "";
  const suggestions = questions.flatMap((q) => [q.text_es, q.text_en].filter(Boolean).map((t) => t.replaceAll("{ciudad}", city)));
  const stats = visibilityStats(queries);
  const score = checklistScore(items, checks);
  const checkByItem = new Map(checks.map((c) => [c.checklist_item_id, c]));
  const retested = new Set(queries.map((q) => q.retest_of_id).filter(Boolean));

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <p className="small"><Link href={`/admin/negocios/${biz.id}`}>← {biz.name}</Link></p>
          <h1 style={{ marginBottom: 6 }}>{T(KIND_LABEL[audit.kind])} #{audit.id}</h1>
          <StatusBadge status={audit.status} />{" "}
          <span className="small muted">{T.lang === "en" ? biz.category_name_en : biz.category_name} · {city}, {biz.province_name}{audit.parent_audit_id ? ` ${T("· re-medición de #{n}", { n: audit.parent_audit_id })}` : ""}</span>
        </div>
        <div className="btn-row">
          <Link className="btn btn-primary btn-sm" href={`/admin/informe/${audit.id}`}>{T("Ver informe")}</Link>
          {audit.kind !== "followup" && audit.status === "completada" && (
            <form action={createFollowupAction}>
              <input type="hidden" name="audit_id" value={audit.id} />
              <button className="btn btn-ghost btn-sm">{T("Crear re-medición")}</button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card stat"><b>{stats.total ? `${stats.yes}/${stats.total}` : "—"}</b><span>{T("Consultas donde aparece")}{stats.total ? ` (${pct(stats.rate)})` : ""}</span></div>
        <div className="card stat"><b>{stats.competitors.length}</b><span>{T("Competidores distintos mencionados")}</span></div>
        <div className="card stat"><b>{score.score === null ? "—" : `${score.score}/100`}</b><span>{T("Checklist ({done}/{total} evaluados)", { done: score.evaluated, total: score.total })}</span></div>
      </div>

      <details className="box">
        <summary>{T("Protocolo de consulta manual (léelo antes de registrar)")}</summary>
        <ol className="small" style={{ marginTop: 10 }}>
          <li>{T("Usa una ventana privada/incógnito y sin sesión iniciada (o una cuenta de prueba sin historial).")}</li>
          <li>{T("Escribe la ubicación dentro de la pregunta (“en {city}”) en vez de depender de la geolocalización.", { city: city || "Cotacachi" })}</li>
          <li>{T("Copia la pregunta exacta y la respuesta completa. Registra la hora real de la consulta.")}</li>
          <li>{T("Anota todos los negocios mencionados, en orden, y las fuentes que cite la plataforma.")}</li>
          <li>{T("No marques “Sí aparece” si solo aparece un negocio con nombre parecido.")}</li>
          <li>{T("Si una plataforma no responde o pide iniciar sesión, anótalo en observaciones en vez de inventar el resultado.")}</li>
        </ol>
      </details>

      {/* ---------- Consultas ---------- */}
      <section id="consultas" className="card">
        <h2>{T("1. Consultas a plataformas de IA y búsqueda")}</h2>

        {audit.parent_audit_id && parentQueries.length > 0 && (
          <div className="alert alert-warn small" style={{ marginBottom: 14 }}>
            {T("Re-medición: repite estas consultas de la auditoría #{n}.", { n: audit.parent_audit_id })}
            <ul style={{ margin: "6px 0 0" }}>
              {parentQueries.map((q) => (
                <li key={q.id}>
                  {retested.has(q.id) ? "✓ " : ""}{platformName(q.platform)} — “{q.question}”{" "}
                  {!retested.has(q.id) && <Link href={`/admin/auditorias/${audit.id}?retest=${q.id}#nueva-consulta`}>{T("Re-probar")}</Link>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {queries.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 18 }}>
            <table>
              <thead><tr><th>{T("Pregunta")}</th><th>{T("Plataforma")}</th><th>{T("Resultado")}</th><th>{T("Competidores")}</th><th>{T("Fecha")}</th><th></th></tr></thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id}>
                    <td>
                      {q.question}
                      {q.retest_of_id ? <div className="small muted">{T("Re-prueba de #{n}", { n: q.retest_of_id })}</div> : null}
                      {(q.raw_answer || q.observations || q.sources_cited) && (
                        <details className="small" style={{ marginTop: 6 }}>
                          <summary>{T("Detalle")}</summary>
                          {q.businesses_mentioned && <p className="pre"><b>{T("Mencionados:")}</b>{"\n"}{q.businesses_mentioned}</p>}
                          {q.sources_cited && <p className="pre"><b>{T("Fuentes:")}</b>{"\n"}{q.sources_cited}</p>}
                          {q.observations && <p className="pre"><b>{T("Observaciones:")}</b>{"\n"}{q.observations}</p>}
                          {q.raw_answer && <p className="pre muted"><b>{T("Respuesta:")}</b>{"\n"}{q.raw_answer}</p>}
                        </details>
                      )}
                    </td>
                    <td>{platformName(q.platform)}<div className="small muted">{q.method === "manual" ? "Manual" : "API"}</div></td>
                    <td><AppearedBadge value={q.appeared} />{q.position ? <div className="small muted">{T("Posición {n}", { n: q.position })}</div> : null}</td>
                    <td className="small pre">{q.competitors || "—"}</td>
                    <td className="small">{q.tested_at.replace("T", " ")}</td>
                    <td className="small">
                      <Link href={`/admin/auditorias/${audit.id}?retest=${q.id}#nueva-consulta`}>{T("Re-probar")}</Link>
                      <form action={deleteQueryAction} style={{ marginTop: 6 }}>
                        <input type="hidden" name="audit_id" value={audit.id} />
                        <input type="hidden" name="id" value={q.id} />
                        <button className="btn btn-danger btn-sm">{T("Borrar")}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form id="nueva-consulta" action={addQueryAction} key={sp.retest ?? "new"} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <h3>{retestSource ? T("Re-probar consulta #{n}", { n: retestSource.id }) : T("Registrar consulta")}</h3>
          <input type="hidden" name="audit_id" value={audit.id} />
          {retestSource && <input type="hidden" name="retest_of_id" value={retestSource.id} />}
          <div className="field">
            <label htmlFor="question">{T("Pregunta exacta")}</label>
            <input id="question" name="question" type="text" required list="suggested-q" defaultValue={retestSource?.question} />
            <datalist id="suggested-q">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
            <span className="hint">{T("Sugerencias de la categoría con el cantón del negocio. Edita libremente.")}</span>
          </div>
          <div className="row-3">
            <div className="field">
              <label htmlFor="platform">{T("Plataforma")}</label>
              <select id="platform" name="platform" defaultValue={retestSource?.platform ?? "chatgpt"}>
                {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="method">{T("Método")}</label>
              <select id="method" name="method" defaultValue="manual">
                <option value="manual">Manual</option>
                <option value="api" disabled>{T("API (sin conector configurado)")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="tested_at">{T("Fecha y hora (Ecuador)")}</label>
              <input id="tested_at" name="tested_at" type="datetime-local" required defaultValue={nowEcuador()} />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="appeared">{T("¿Apareció el negocio?")}</label>
              <select id="appeared" name="appeared" required defaultValue="">
                <option value="" disabled>{T("Selecciona…")}</option>
                <option value="si">{T("Sí aparece")}</option>
                <option value="parcial">{T("Parcial / mal descrito")}</option>
                <option value="no">{T("No aparece")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="position">{T("Posición en la lista (si aparece)")}</label>
              <input id="position" name="position" type="number" min="1" max="50" />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="businesses_mentioned">{T("Negocios mencionados (uno por línea, en orden)")}</label>
              <textarea id="businesses_mentioned" name="businesses_mentioned" />
            </div>
            <div className="field">
              <label htmlFor="competitors">{T("Competidores directos mencionados")}</label>
              <textarea id="competitors" name="competitors" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="sources_cited">{T("Fuentes citadas por la plataforma (URLs o nombres)")}</label>
            <textarea id="sources_cited" name="sources_cited" rows={2} />
          </div>
          <div className="field">
            <label htmlFor="raw_answer">{T("Respuesta completa (copiar y pegar)")}</label>
            <textarea id="raw_answer" name="raw_answer" rows={5} />
          </div>
          <div className="field">
            <label htmlFor="observations">{T("Observaciones")}</label>
            <textarea id="observations" name="observations" rows={2} placeholder={T("Datos incorrectos sobre el negocio, si pidió ubicación, etc.")} />
          </div>
          <button className="btn btn-primary btn-sm">{T("Guardar consulta")}</button>
        </form>
      </section>

      {/* ---------- Checklist ---------- */}
      <section id="checklist" className="card">
        <h2>{T("2. Checklist de {category}", { category: (T.lang === "en" ? biz.category_name_en : biz.category_name) ?? T("la categoría") })}</h2>
        {/* key: remonta el formulario tras guardar para que muestre los valores nuevos */}
        <form action={saveChecksAction} key={checks.map((c) => `${c.checklist_item_id}:${c.result}:${c.evidence}`).join("|")}>
          <input type="hidden" name="audit_id" value={audit.id} />
          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table>
              <thead><tr><th>{T("Punto")}</th><th>{T("Peso")}</th><th>{T("Resultado")}</th><th>{T("Evidencia / nota")}</th></tr></thead>
              <tbody>
                {items.map((it) => {
                  const c = checkByItem.get(it.id);
                  return (
                    <tr key={it.id}>
                      <td>{T.lang === "en" ? it.label_en : it.label_es}{it.category_id === null ? <div className="small muted">{T("General")}</div> : null}</td>
                      <td>{it.weight}</td>
                      <td>
                        <select name={`result_${it.id}`} defaultValue={c?.result ?? "desconocido"} aria-label={T("Resultado: {item}", { item: T.lang === "en" ? it.label_en : it.label_es })}>
                          <option value="desconocido">{T("Sin evaluar")}</option>
                          <option value="cumple">{T("Cumple")}</option>
                          <option value="parcial">{T("Parcial")}</option>
                          <option value="no_cumple">{T("No cumple")}</option>
                        </select>
                      </td>
                      <td><input type="text" name={`evidence_${it.id}`} defaultValue={c?.evidence} aria-label={T("Evidencia: {item}", { item: T.lang === "en" ? it.label_en : it.label_es })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary btn-sm">{T("Guardar checklist")}</button>
        </form>
      </section>

      {/* ---------- Recomendaciones ---------- */}
      <section id="recomendaciones" className="card">
        <h2>{T("3. Recomendaciones")}</h2>
        <p className="small muted">{T("Cada recomendación debe basarse en un hallazgo (consulta o punto del checklist) o declararse como supuesto.")}</p>
        {recs.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 16 }}>
            <table>
              <thead><tr><th>{T("Prioridad")}</th><th>{T("Área")}</th><th>{T("Recomendación")}</th><th>{T("Base")}</th><th></th></tr></thead>
              <tbody>
                {recs.map((r) => (
                  <tr key={r.id}>
                    <td><span className={`badge ${r.priority === "alta" ? "badge-danger" : r.priority === "media" ? "badge-warn" : ""}`}>{T(r.priority[0].toUpperCase() + r.priority.slice(1))}</span></td>
                    <td className="small">{REC_AREAS.find((a) => a.id === r.area)?.[T.lang] ?? r.area}</td>
                    <td className="pre">{r.text}</td>
                    <td className="small"><b>{r.basis === "hallazgo" ? T("Hallazgo") : T("Supuesto")}</b>{r.basis_ref ? <div className="muted">{r.basis_ref}</div> : null}</td>
                    <td>
                      <form action={deleteRecommendationAction}>
                        <input type="hidden" name="audit_id" value={audit.id} />
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn btn-danger btn-sm">{T("Borrar")}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form action={addRecommendationAction}>
          <input type="hidden" name="audit_id" value={audit.id} />
          <div className="row-3">
            <div className="field">
              <label htmlFor="area">{T("Área")}</label>
              <select id="area" name="area">{REC_AREAS.map((a) => <option key={a.id} value={a.id}>{a[T.lang]}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="priority">{T("Prioridad")}</label>
              <select id="priority" name="priority" defaultValue="media"><option value="alta">{T("Alta")}</option><option value="media">{T("Media")}</option><option value="baja">{T("Baja")}</option></select>
            </div>
            <div className="field">
              <label htmlFor="basis">{T("Base")}</label>
              <select id="basis" name="basis"><option value="hallazgo">{T("Hallazgo")}</option><option value="supuesto">{T("Supuesto")}</option></select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="basis_ref">{T("Referencia del hallazgo (obligatoria si la base es “Hallazgo”)")}</label>
            <input id="basis_ref" name="basis_ref" type="text" placeholder={T("Ej.: Consulta #12 (ChatGPT) / Checklist: horario")} />
          </div>
          <div className="field">
            <label htmlFor="text">{T("Recomendación (texto para el cliente)")}</label>
            <textarea id="text" name="text" required />
          </div>
          <button className="btn btn-primary btn-sm">{T("Agregar recomendación")}</button>
        </form>
      </section>

      {/* ---------- Cierre ---------- */}
      <section className="card">
        <h2>{T("4. Resumen y estado")}</h2>
        <form action={updateAuditAction} key={`${audit.status}|${audit.report_lang}|${audit.summary}`}>
          <input type="hidden" name="audit_id" value={audit.id} />
          <div className="field">
            <label htmlFor="summary">{T("Resumen ejecutivo (aparece al inicio del informe)")}</label>
            <textarea id="summary" name="summary" rows={5} defaultValue={audit.summary} />
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="status">{T("Estado")}</label>
              <select id="status" name="status" defaultValue={audit.status}>
                <option value="borrador">{T("Borrador")}</option>
                <option value="en_progreso">{T("En progreso")}</option>
                <option value="completada">{T("Completada")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="report_lang">{T("Idioma del informe")}</label>
              <select id="report_lang" name="report_lang" defaultValue={audit.report_lang}>
                <option value="es">{T("Español")}</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-sm">{T("Guardar")}</button>
        </form>
      </section>
    </div>
  );
}
