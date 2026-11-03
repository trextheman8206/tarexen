import { adminT, adminTitle } from "@/lib/admin-i18n";
import Link from "next/link";
import { PRICING_STATUS } from "@/config/pricing";
import { requireUser } from "@/lib/auth";
import { dashboardStats, BUSINESS_STATUSES } from "@/lib/repo";
import { can, ROLE_INFO } from "@/lib/roles";
import { createDemoAction } from "../actions";
import { AdminLangToggle, StatusBadge } from "./ui";

export async function generateMetadata() {
  return adminTitle("Resumen");
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ "sin-permiso"?: string }> }) {
  const T = await adminT();
  const user = await requireUser();
  const sp = await searchParams;
  const s = await dashboardStats();
  const leads = BUSINESS_STATUSES.reduce((n, st) => n + (s.byStatus[st] ?? 0), 0);
  const seesMoney = can(user.role, "payments.manage");

  return (
    <div className="stack">
      <div className="page-head">
        <h1>{T("Resumen")}</h1>
        <div className="btn-row">
          {can(user.role, "demo.create") && (
            <form action={createDemoAction}>
              <button className="btn btn-ghost btn-sm" title={T("Crea un negocio y auditoría marcados como DEMO")}>{T("+ Crear datos DEMO")}</button>
            </form>
          )}
          <AdminLangToggle />
        </div>
      </div>

      {sp["sin-permiso"] && (
        <p className="alert alert-warn small" style={{ margin: 0 }}>{T("Tu tipo de acceso ({role}) no permite abrir esa sección.", { role: T(ROLE_INFO[user.role].label) })}</p>
      )}

      {seesMoney && PRICING_STATUS === "proposed" && (
        <p className="alert alert-warn small" style={{ margin: 0 }}>
          {T("Los precios publicados son propuestos (hipótesis sin validar). Ver docs/01-negocio.md §4 y el plan de validación.")}
        </p>
      )}

      <div className="grid grid-4">
        <div className="card stat"><b>{leads}</b><span>{T("Negocios registrados (sin demo)")}</span></div>
        <div className="card stat"><b>{s.byStatus.cliente ?? 0}</b><span>{T("Clientes")}</span></div>
        {seesMoney && <div className="card stat"><b>USD {s.revenue.month.toFixed(2)}</b><span>{T("Ingresos este mes")}</span></div>}
        {seesMoney && <div className="card stat"><b>USD {s.revenue.total.toFixed(2)}</b><span>{T("Ingresos totales")}</span></div>}
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h2>{T("Embudo")}</h2>
          <table>
            <tbody>
              {BUSINESS_STATUSES.map((st) => (
                <tr key={st}>
                  <td><StatusBadge status={st} /></td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{s.byStatus[st] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted" style={{ marginTop: 10 }}>
            {T("Auditorías: {draft} borrador · {progress} en progreso · {done} completadas", { draft: s.audits.borrador ?? 0, progress: s.audits.en_progreso ?? 0, done: s.audits.completada ?? 0 })}
          </p>
        </div>
        <div className="card">
          <h2>{T("Re-mediciones pendientes")}</h2>
          {s.followupsDue.length === 0 ? (
            <p className="muted">{T("Ninguna. Aparecen aquí 25 días después de completar una auditoría.")}</p>
          ) : (
            <ul>
              {s.followupsDue.map((f) => (
                <li key={f.id}>
                  <Link href={`/admin/auditorias/${f.id}`}>{f.business_name}</Link>{" "}
                  <span className="muted small">{T("— completada {date}", { date: f.completed_at.slice(0, 10) })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2>{T("Últimos registros")}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{T("Negocio")}</th><th>{T("Categoría")}</th><th>{T("Ubicación")}</th><th>{T("Estado")}</th><th>{T("Fecha")}</th></tr></thead>
            <tbody>
              {s.recent.length === 0 && <tr><td colSpan={5} className="muted">{T("Todavía no hay registros. Comparte el formulario /es/analisis-gratis.")}</td></tr>}
              {s.recent.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/admin/negocios/${b.id}`}>{b.name}</Link> {b.is_demo ? <span className="badge badge-warn">DEMO</span> : null}</td>
                  <td>{(T.lang === "en" ? b.category_name_en : b.category_name) ?? "—"}</td>
                  <td>{[b.canton_name, b.province_name].filter(Boolean).join(", ")}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className="small">{b.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
