import { adminT, adminTitle } from "@/lib/admin-i18n";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { BUSINESS_STATUSES, getBusiness, listAuditsForBusiness, listPayments } from "@/lib/repo";
import { can } from "@/lib/roles";
import { addPaymentAction, createAuditAction, updateBusinessAction } from "../../../actions";
import { KIND_LABEL, StatusBadge, statusLabel } from "../../ui";

export async function generateMetadata() {
  return adminTitle("Negocio");
}

function waLink(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "593" + digits.slice(1); // número local ecuatoriano
  return `https://wa.me/${digits}`;
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const T = await adminT();
  const user = await requirePerm("leads.view");
  const may = {
    editLead: can(user.role, "leads.edit"),
    audits: can(user.role, "audits.edit"),
    reports: can(user.role, "reports.view"),
    payments: can(user.role, "payments.manage"),
  };
  const { id } = await params;
  const b = await getBusiness(Number(id));
  if (!b) notFound();
  const [audits, payments] = await Promise.all([listAuditsForBusiness(b.id), may.payments ? listPayments(b.id) : Promise.resolve([])]);
  const location = [b.parish_name ?? b.parish_text, b.neighborhood, b.canton_name, b.province_name].filter(Boolean).join(", ");

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <p className="small"><Link href="/admin/negocios">{T("← Negocios")}</Link></p>
          <h1 style={{ marginBottom: 6 }}>{b.name} {b.is_demo ? <span className="badge badge-warn">DEMO</span> : null}</h1>
          <StatusBadge status={b.status} /> <span className="muted small">· {T.lang === "en" ? b.category_name_en : b.category_name}{b.subcategory_name ? ` › ${T.lang === "en" ? b.subcategory_name_en : b.subcategory_name}` : ""}{b.other_industry ? ` › ${b.other_industry}` : ""}</span>
        </div>
        <div className="btn-row">
          {b.contact_whatsapp && <a className="btn btn-wa btn-sm" href={waLink(b.contact_whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {b.contact_email && <a className="btn btn-ghost btn-sm" href={`mailto:${b.contact_email}`}>Email</a>}
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h2>{T("Datos del negocio")}</h2>
          <dl className="kv">
            <dt>{T("Ubicación")}</dt><dd>{location || "—"}</dd>
            <dt>{T("Dirección")}</dt><dd>{b.address || "—"}</dd>
            <dt>{T("Local físico")}</dt><dd>{b.has_physical_location ? T("Sí") : "No"}</dd>
            <dt>{T("Atención")}</dt><dd>{[b.serves_in_person && T("En persona"), b.serves_online && T("En línea")].filter(Boolean).join(" · ") || "—"}</dd>
            <dt>Delivery</dt><dd>{b.offers_delivery ? T("Sí — {area}", { area: b.delivery_area || T("zona no indicada") }) : "No"}</dd>
            <dt>{T("Zona de servicio")}</dt><dd>{b.service_area || "—"}</dd>
            <dt>{T("Ciudades cercanas")}</dt><dd>{b.nearby_cities || "—"}</dd>
            <dt>Web</dt><dd>{b.website ? <a href={b.website} target="_blank" rel="noopener noreferrer nofollow">{b.website}</a> : "—"}</dd>
            <dt>Google</dt><dd>{b.gbp_url ? <a href={b.gbp_url} target="_blank" rel="noopener noreferrer nofollow">{T("Abrir ficha")}</a> : "—"}</dd>
            <dt>{T("Redes")}</dt><dd>{b.social_links || "—"}</dd>
            <dt>{T("Productos/servicios")}</dt><dd>{b.products_services || "—"}</dd>
            <dt>{T("Clientes objetivo")}</dt><dd>{b.target_customers || "—"}</dd>
          </dl>
        </div>
        <div className="stack">
          <div className="card">
            <h2>{T("Contacto")}</h2>
            <dl className="kv">
              <dt>{T("Nombre")}</dt><dd>{b.contact_name}</dd>
              <dt>WhatsApp</dt><dd>{b.contact_whatsapp || "—"}</dd>
              <dt>Email</dt><dd>{b.contact_email || "—"}</dd>
              <dt>{T("Idioma informe")}</dt><dd>{b.preferred_lang === "en" ? T("Inglés") : T("Español")}</dd>
              <dt>{T("Consentimiento")}</dt><dd className="small">{b.consent_at.slice(0, 16).replace("T", " ")} (v. {b.consent_version})</dd>
              <dt>{T("Origen")}</dt><dd>{b.source}</dd>
            </dl>
          </div>
          {may.editLead && <form action={updateBusinessAction} className="card" key={b.updated_at + b.status}>
            <h2>{T("Seguimiento comercial")}</h2>
            <input type="hidden" name="id" value={b.id} />
            <div className="field">
              <label htmlFor="status">{T("Estado")}</label>
              <select id="status" name="status" defaultValue={b.status}>
                {BUSINESS_STATUSES.map((s) => <option key={s} value={s}>{T(statusLabel(s))}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="notes">{T("Notas internas")}</label>
              <textarea id="notes" name="notes" defaultValue={b.notes} placeholder={T("Objeciones, precio ofrecido, próxima acción…")} />
            </div>
            <button className="btn btn-primary btn-sm">{T("Guardar")}</button>
          </form>}
        </div>
      </div>

      <div className="card">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2>{T("Auditorías")}</h2>
          {may.audits && (
            <form action={createAuditAction} className="btn-row">
              <input type="hidden" name="business_id" value={b.id} />
              <button name="kind" value="snapshot" className="btn btn-ghost btn-sm">{T("+ Snapshot gratis")}</button>
              <button name="kind" value="full" className="btn btn-primary btn-sm">{T("+ Auditoría completa")}</button>
            </form>
          )}
        </div>
        {audits.length === 0 ? <p className="muted">{T("Sin auditorías todavía.")}</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>{T("Tipo")}</th><th>{T("Estado")}</th><th>{T("Consultas")}</th><th>{T("Aparece")}</th><th>{T("Creada")}</th><th></th></tr></thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{T(KIND_LABEL[a.kind])}{a.parent_audit_id ? <span className="small muted"> {T("(de #{n})", { n: a.parent_audit_id })}</span> : null}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.query_count}</td>
                    <td>{a.query_count ? `${a.appeared_count}/${a.query_count}` : "—"}</td>
                    <td className="small">{a.created_at.slice(0, 10)}</td>
                    <td>
                      {may.audits && <><Link href={`/admin/auditorias/${a.id}`}>{T("Abrir")}</Link> · </>}
                      {may.reports && <Link href={`/admin/informe/${a.id}`}>{T("Informe")}</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {may.payments && <div className="card">
        <h2>{T("Pagos")}</h2>
        {payments.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 14 }}>
            <table>
              <thead><tr><th>{T("Fecha")}</th><th>Plan</th><th>{T("Monto")}</th><th>{T("Método")}</th><th>{T("Comprobante")}</th><th>{T("Nota")}</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}><td>{p.paid_at}</td><td>{p.plan}</td><td>USD {p.amount_usd.toFixed(2)}</td><td>{p.method}</td><td>{p.invoice_ref || "—"}</td><td>{p.note}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form action={addPaymentAction}>
          <input type="hidden" name="business_id" value={b.id} />
          <div className="row-3">
            <div className="field"><label htmlFor="amount_usd">{T("Monto USD")}</label><input id="amount_usd" name="amount_usd" type="number" min="0" step="0.01" required /></div>
            <div className="field"><label htmlFor="plan">Plan</label><select id="plan" name="plan"><option value="business">Business</option><option value="pro">{T("Pro (mes)")}</option><option value="otro">{T("Otro")}</option></select></div>
            <div className="field"><label htmlFor="paid_at">{T("Fecha")}</label><input id="paid_at" name="paid_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            <div className="field"><label htmlFor="method">{T("Método")}</label><input id="method" name="method" type="text" placeholder={T("Transferencia, efectivo…")} /></div>
            <div className="field"><label htmlFor="invoice_ref">{T("N.º comprobante SRI")}</label><input id="invoice_ref" name="invoice_ref" type="text" /></div>
            <div className="field"><label htmlFor="note">{T("Nota")}</label><input id="note" name="note" type="text" /></div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>{T("Registrar pago")}</button>
        </form>
      </div>}
    </div>
  );
}
