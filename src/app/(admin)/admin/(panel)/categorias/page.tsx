import { adminT, adminTitle } from "@/lib/admin-i18n";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { db, plain } from "@/lib/db";
import { createCategoryAction } from "../../actions";

export async function generateMetadata() {
  return adminTitle("Categorías");
}

export default async function CategoriesAdmin() {
  const T = await adminT();
  await requirePerm("categories.manage");
  const c = await db();
  const rows = plain<{ id: number; slug: string; name_es: string; name_en: string; icon: string; active: number; sort: number; subs: number; checks: number; questions: number; businesses: number }>(
    await c.execute(`
      SELECT cat.id, cat.slug, cat.name_es, cat.name_en, cat.icon, cat.active, cat.sort,
        (SELECT COUNT(*) FROM subcategories s WHERE s.category_id = cat.id) AS subs,
        (SELECT COUNT(*) FROM checklist_items i WHERE i.category_id = cat.id) AS checks,
        (SELECT COUNT(*) FROM example_questions q WHERE q.category_id = cat.id) AS questions,
        (SELECT COUNT(*) FROM businesses b WHERE b.category_id = cat.id) AS businesses
      FROM categories cat ORDER BY cat.sort, cat.id`),
  );

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{T("Categorías")}</h1>
          <p className="muted" style={{ margin: 0 }}>{T("Se editan aquí, sin tocar código. Los cambios aparecen de inmediato en el sitio, el formulario y las auditorías.")}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{T("Orden")}</th><th>{T("Categoría")}</th><th>{T("Slug (URL)")}</th><th>{T("Tipos")}</th><th>Checklist</th><th>{T("Preguntas")}</th><th>{T("Negocios")}</th><th>{T("Estado")}</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.sort}</td>
                <td><Link href={`/admin/categorias/${r.id}`}>{r.icon} {T.lang === "en" ? r.name_en : r.name_es}</Link></td>
                <td className="small">/categorias/{r.slug}</td>
                <td>{r.subs}</td><td>{r.checks}</td><td>{r.questions}</td><td>{r.businesses}</td>
                <td>{r.active ? <span className="badge badge-ok">{T("Activa")}</span> : <span className="badge">{T("Oculta")}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createCategoryAction} className="card">
        <h2>{T("Nueva categoría")}</h2>
        <div className="row-3">
          <div className="field"><label htmlFor="name_es">{T("Nombre (ES)")}</label><input id="name_es" name="name_es" type="text" required /></div>
          <div className="field"><label htmlFor="name_en">{T("Nombre (EN)")}</label><input id="name_en" name="name_en" type="text" /></div>
          <div className="field"><label htmlFor="icon">{T("Icono (emoji)")}</label><input id="icon" name="icon" type="text" maxLength={8} /></div>
        </div>
        <div className="field"><label htmlFor="slug">{T("Slug (opcional; se genera del nombre)")}</label><input id="slug" name="slug" type="text" /></div>
        <button className="btn btn-primary btn-sm">{T("Crear y editar")}</button>
      </form>
    </div>
  );
}
