import Link from "next/link";
import { PRICING_STATUS } from "@/config/pricing";
import { dashboardStats, BUSINESS_STATUSES } from "@/lib/repo";
import { createDemoAction } from "../actions";
import { StatusBadge } from "./ui";

export const metadata = { title: "Resumen" };

export default async function Dashboard() {
  const s = await dashboardStats();
  const leads = BUSINESS_STATUSES.reduce((n, st) => n + (s.byStatus[st] ?? 0), 0);

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Resumen</h1>
        <form action={createDemoAction}>
          <button className="btn btn-ghost btn-sm" title="Crea un negocio y auditoría marcados como DEMO">+ Crear datos DEMO</button>
        </form>
      </div>

      {PRICING_STATUS === "proposed" && (
        <p className="alert alert-warn small" style={{ margin: 0 }}>
          Los precios publicados son <b>propuestos</b> (hipótesis sin validar). Ver docs/01-negocio.md §4 y el plan de validación.
        </p>
      )}

      <div className="grid grid-4">
        <div className="card stat"><b>{leads}</b><span>Negocios registrados (sin demo)</span></div>
        <div className="card stat"><b>{s.byStatus.cliente ?? 0}</b><span>Clientes</span></div>
        <div className="card stat"><b>USD {s.revenue.month.toFixed(2)}</b><span>Ingresos este mes</span></div>
        <div className="card stat"><b>USD {s.revenue.total.toFixed(2)}</b><span>Ingresos totales</span></div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h2>Embudo</h2>
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
            Auditorías: {s.audits.borrador ?? 0} borrador · {s.audits.en_progreso ?? 0} en progreso · {s.audits.completada ?? 0} completadas
          </p>
        </div>
        <div className="card">
          <h2>Re-mediciones pendientes</h2>
          {s.followupsDue.length === 0 ? (
            <p className="muted">Ninguna. Aparecen aquí 25 días después de completar una auditoría.</p>
          ) : (
            <ul>
              {s.followupsDue.map((f) => (
                <li key={f.id}>
                  <Link href={`/admin/auditorias/${f.id}`}>{f.business_name}</Link>{" "}
                  <span className="muted small">— completada {f.completed_at.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2>Últimos registros</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Negocio</th><th>Categoría</th><th>Ubicación</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {s.recent.length === 0 && <tr><td colSpan={5} className="muted">Todavía no hay registros. Comparte el formulario /es/analisis-gratis.</td></tr>}
              {s.recent.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/admin/negocios/${b.id}`}>{b.name}</Link> {b.is_demo ? <span className="badge badge-warn">DEMO</span> : null}</td>
                  <td>{b.category_name ?? "—"}</td>
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
