import Link from "next/link";
import { notFound } from "next/navigation";
import { BUSINESS_STATUSES, getBusiness, listAuditsForBusiness, listPayments } from "@/lib/repo";
import { addPaymentAction, createAuditAction, updateBusinessAction } from "../../../actions";
import { KIND_LABEL, StatusBadge, statusLabel } from "../../ui";

export const metadata = { title: "Negocio" };

const yes = (n: number) => (n ? "Sí" : "No");

function waLink(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "593" + digits.slice(1); // número local ecuatoriano
  return `https://wa.me/${digits}`;
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBusiness(Number(id));
  if (!b) notFound();
  const [audits, payments] = await Promise.all([listAuditsForBusiness(b.id), listPayments(b.id)]);
  const location = [b.parish_name ?? b.parish_text, b.neighborhood, b.canton_name, b.province_name].filter(Boolean).join(", ");

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <p className="small"><Link href="/admin/negocios">← Negocios</Link></p>
          <h1 style={{ marginBottom: 6 }}>{b.name} {b.is_demo ? <span className="badge badge-warn">DEMO</span> : null}</h1>
          <StatusBadge status={b.status} /> <span className="muted small">· {b.category_name}{b.subcategory_name ? ` › ${b.subcategory_name}` : ""}{b.other_industry ? ` › ${b.other_industry}` : ""}</span>
        </div>
        <div className="btn-row">
          {b.contact_whatsapp && <a className="btn btn-wa btn-sm" href={waLink(b.contact_whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {b.contact_email && <a className="btn btn-ghost btn-sm" href={`mailto:${b.contact_email}`}>Email</a>}
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h2>Datos del negocio</h2>
          <dl className="kv">
            <dt>Ubicación</dt><dd>{location || "—"}</dd>
            <dt>Dirección</dt><dd>{b.address || "—"}</dd>
            <dt>Local físico</dt><dd>{yes(b.has_physical_location)}</dd>
            <dt>Atención</dt><dd>{[b.serves_in_person && "En persona", b.serves_online && "En línea"].filter(Boolean).join(" · ") || "—"}</dd>
            <dt>Delivery</dt><dd>{b.offers_delivery ? `Sí — ${b.delivery_area || "zona no indicada"}` : "No"}</dd>
            <dt>Zona de servicio</dt><dd>{b.service_area || "—"}</dd>
            <dt>Ciudades cercanas</dt><dd>{b.nearby_cities || "—"}</dd>
            <dt>Web</dt><dd>{b.website ? <a href={b.website} target="_blank" rel="noopener noreferrer nofollow">{b.website}</a> : "—"}</dd>
            <dt>Google</dt><dd>{b.gbp_url ? <a href={b.gbp_url} target="_blank" rel="noopener noreferrer nofollow">Abrir ficha</a> : "—"}</dd>
            <dt>Redes</dt><dd>{b.social_links || "—"}</dd>
            <dt>Productos/servicios</dt><dd>{b.products_services || "—"}</dd>
            <dt>Clientes objetivo</dt><dd>{b.target_customers || "—"}</dd>
          </dl>
        </div>
        <div className="stack">
          <div className="card">
            <h2>Contacto</h2>
            <dl className="kv">
              <dt>Nombre</dt><dd>{b.contact_name}</dd>
              <dt>WhatsApp</dt><dd>{b.contact_whatsapp || "—"}</dd>
              <dt>Email</dt><dd>{b.contact_email || "—"}</dd>
              <dt>Idioma informe</dt><dd>{b.preferred_lang === "en" ? "Inglés" : "Español"}</dd>
              <dt>Consentimiento</dt><dd className="small">{b.consent_at.slice(0, 16).replace("T", " ")} (v. {b.consent_version})</dd>
              <dt>Origen</dt><dd>{b.source}</dd>
            </dl>
          </div>
          <form action={updateBusinessAction} className="card" key={b.updated_at + b.status}>
            <h2>Seguimiento comercial</h2>
            <input type="hidden" name="id" value={b.id} />
            <div className="field">
              <label htmlFor="status">Estado</label>
              <select id="status" name="status" defaultValue={b.status}>
                {BUSINESS_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="notes">Notas internas</label>
              <textarea id="notes" name="notes" defaultValue={b.notes} placeholder="Objeciones, precio ofrecido, próxima acción…" />
            </div>
            <button className="btn btn-primary btn-sm">Guardar</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2>Auditorías</h2>
          <form action={createAuditAction} className="btn-row">
            <input type="hidden" name="business_id" value={b.id} />
            <button name="kind" value="snapshot" className="btn btn-ghost btn-sm">+ Snapshot gratis</button>
            <button name="kind" value="full" className="btn btn-primary btn-sm">+ Auditoría completa</button>
          </form>
        </div>
        {audits.length === 0 ? <p className="muted">Sin auditorías todavía.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Tipo</th><th>Estado</th><th>Consultas</th><th>Aparece</th><th>Creada</th><th></th></tr></thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{KIND_LABEL[a.kind]}{a.parent_audit_id ? <span className="small muted"> (de #{a.parent_audit_id})</span> : null}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.query_count}</td>
                    <td>{a.query_count ? `${a.appeared_count}/${a.query_count}` : "—"}</td>
                    <td className="small">{a.created_at.slice(0, 10)}</td>
                    <td><Link href={`/admin/auditorias/${a.id}`}>Abrir</Link> · <Link href={`/admin/informe/${a.id}`}>Informe</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Pagos</h2>
        {payments.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 14 }}>
            <table>
              <thead><tr><th>Fecha</th><th>Plan</th><th>Monto</th><th>Método</th><th>Comprobante</th><th>Nota</th></tr></thead>
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
            <div className="field"><label htmlFor="amount_usd">Monto USD</label><input id="amount_usd" name="amount_usd" type="number" min="0" step="0.01" required /></div>
            <div className="field"><label htmlFor="plan">Plan</label><select id="plan" name="plan"><option value="business">Business</option><option value="pro">Pro (mes)</option><option value="otro">Otro</option></select></div>
            <div className="field"><label htmlFor="paid_at">Fecha</label><input id="paid_at" name="paid_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            <div className="field"><label htmlFor="method">Método</label><input id="method" name="method" type="text" placeholder="Transferencia, efectivo…" /></div>
            <div className="field"><label htmlFor="invoice_ref">N.º comprobante SRI</label><input id="invoice_ref" name="invoice_ref" type="text" /></div>
            <div className="field"><label htmlFor="note">Nota</label><input id="note" name="note" type="text" /></div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>Registrar pago</button>
        </form>
      </div>
    </div>
  );
}
