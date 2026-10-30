import Link from "next/link";
import { BUSINESS_STATUSES, listBusinesses, listCategories } from "@/lib/repo";
import { StatusBadge, statusLabel } from "../ui";

export const metadata = { title: "Negocios" };

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<{ estado?: string; categoria?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = BUSINESS_STATUSES.includes(sp.estado as never) ? sp.estado : undefined;
  const categoryId = Number(sp.categoria) || undefined;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const [rows, categories] = await Promise.all([listBusinesses({ status, categoryId, q }), listCategories()]);

  return (
    <div>
      <div className="page-head"><h1>Negocios y leads</h1></div>
      <form className="filters" method="get">
        <div className="field">
          <label htmlFor="q">Buscar</label>
          <input id="q" name="q" type="text" defaultValue={q} placeholder="Nombre, contacto o cantón" />
        </div>
        <div className="field">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {BUSINESS_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={categoryId ?? ""}>
            <option value="">Todas</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_es}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm">Filtrar</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Negocio</th><th>Categoría</th><th>Ubicación</th><th>Contacto</th><th>Estado</th><th>Registro</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="muted">Sin resultados.</td></tr>}
            {rows.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={`/admin/negocios/${b.id}`}><b>{b.name}</b></Link>{" "}
                  {b.is_demo ? <span className="badge badge-warn">DEMO</span> : null}
                  <div className="small muted">{b.source}</div>
                </td>
                <td>{b.category_name ?? "—"}{b.subcategory_name ? <div className="small muted">{b.subcategory_name}</div> : null}</td>
                <td>{b.canton_name}<div className="small muted">{b.province_name}</div></td>
                <td>{b.contact_name}<div className="small muted">{b.contact_whatsapp ?? b.contact_email}</div></td>
                <td><StatusBadge status={b.status} /></td>
                <td className="small">{b.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
