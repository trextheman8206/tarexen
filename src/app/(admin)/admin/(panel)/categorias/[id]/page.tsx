import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { db, plain } from "@/lib/db";
import { getCategory, listQuestions, listSubcategories, type ChecklistItem } from "@/lib/repo";
import {
  addChecklistItemAction, addQuestionAction, addSubcategoryAction, deleteQuestionAction, toggleSubcategoryAction,
  updateCategoryAction, updateChecklistItemAction,
} from "../../../actions";

export const metadata = { title: "Editar categoría" };

export default async function CategoryEdit({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("categories.manage");
  const { id } = await params;
  const cat = await getCategory(Number(id));
  if (!cat) notFound();
  const c = await db();
  const [subs, questions, items] = await Promise.all([
    listSubcategories(cat.id),
    listQuestions(cat.id),
    c.execute({ sql: "SELECT * FROM checklist_items WHERE category_id = ? ORDER BY sort, id", args: [cat.id] }).then((rs) => plain<ChecklistItem>(rs)),
  ]);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <p className="small"><Link href="/admin/categorias">← Categorías</Link></p>
          <h1>{cat.icon} {cat.name_es}</h1>
        </div>
        {cat.active ? <Link className="btn btn-ghost btn-sm" href={`/es/categorias/${cat.slug}`} target="_blank">Ver página pública ↗</Link> : null}
      </div>

      <form action={updateCategoryAction} className="card" key={JSON.stringify(cat)}>
        <h2>Datos generales</h2>
        <input type="hidden" name="id" value={cat.id} />
        <div className="row-3">
          <div className="field"><label htmlFor="name_es">Nombre (ES)</label><input id="name_es" name="name_es" type="text" required defaultValue={cat.name_es} /></div>
          <div className="field"><label htmlFor="name_en">Nombre (EN)</label><input id="name_en" name="name_en" type="text" required defaultValue={cat.name_en} /></div>
          <div className="field"><label htmlFor="icon">Icono</label><input id="icon" name="icon" type="text" maxLength={8} defaultValue={cat.icon} /></div>
        </div>
        <div className="row-2">
          <div className="field"><label htmlFor="description_es">Descripción (ES)</label><textarea id="description_es" name="description_es" defaultValue={cat.description_es} /></div>
          <div className="field"><label htmlFor="description_en">Descripción (EN)</label><textarea id="description_en" name="description_en" defaultValue={cat.description_en} /></div>
        </div>
        <div className="row-2">
          <div className="field"><label htmlFor="sort">Orden</label><input id="sort" name="sort" type="number" defaultValue={cat.sort} /></div>
          <label className="check" style={{ alignSelf: "center" }}><input type="checkbox" name="active" defaultChecked={!!cat.active} /> Visible en el sitio y el formulario</label>
        </div>
        <p className="small muted">Slug: /categorias/{cat.slug} (no se cambia para no romper enlaces).</p>
        <button className="btn btn-primary btn-sm">Guardar</button>
      </form>

      <div className="card">
        <h2>Tipos de negocio (subcategorías)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {subs.length === 0 && <span className="muted">Ninguno.</span>}
          {subs.map((s) => (
            <form key={s.id} action={toggleSubcategoryAction} className="inline-form">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="category_id" value={cat.id} />
              <button className={`badge ${s.active ? "badge-brand" : ""}`} style={{ cursor: "pointer", textDecoration: s.active ? "none" : "line-through" }} title={s.active ? "Clic para ocultar" : "Clic para activar"}>
                {s.name_es}
              </button>
            </form>
          ))}
        </div>
        <form action={addSubcategoryAction} className="row-3" style={{ alignItems: "end" }}>
          <input type="hidden" name="category_id" value={cat.id} />
          <div className="field"><label htmlFor="sub_es">Nuevo tipo (ES)</label><input id="sub_es" name="name_es" type="text" required /></div>
          <div className="field"><label htmlFor="sub_en">(EN)</label><input id="sub_en" name="name_en" type="text" /></div>
          <button className="btn btn-ghost btn-sm">Agregar</button>
        </form>
      </div>

      <div className="card">
        <h2>Checklist específico</h2>
        <p className="small muted">Se suma a los 12 puntos generales. Peso 1–5 (importancia en el puntaje).</p>
        <div className="table-wrap" style={{ marginBottom: 14 }}>
          <table>
            <thead><tr><th>Texto (ES)</th><th>Texto (EN)</th><th>Peso</th><th>Activo</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={`${it.id}|${it.label_es}|${it.label_en}|${it.weight}|${it.active}`}>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <form action={updateChecklistItemAction} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 70px 60px auto", gap: 8, padding: 8, alignItems: "center" }}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="category_id" value={cat.id} />
                      <input name="label_es" type="text" defaultValue={it.label_es} aria-label="Texto ES" />
                      <input name="label_en" type="text" defaultValue={it.label_en} aria-label="Texto EN" />
                      <input name="weight" type="number" min={1} max={5} defaultValue={it.weight} aria-label="Peso" />
                      <input name="active" type="checkbox" defaultChecked={!!it.active} aria-label="Activo" style={{ width: 20, height: 20 }} />
                      <button className="btn btn-ghost btn-sm">Guardar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={addChecklistItemAction} className="row-3" style={{ alignItems: "end" }}>
          <input type="hidden" name="category_id" value={cat.id} />
          <div className="field"><label htmlFor="ci_es">Nuevo punto (ES)</label><input id="ci_es" name="label_es" type="text" required /></div>
          <div className="field"><label htmlFor="ci_en">(EN)</label><input id="ci_en" name="label_en" type="text" /></div>
          <div className="field"><label htmlFor="ci_w">Peso</label><input id="ci_w" name="weight" type="number" min={1} max={5} defaultValue={2} /></div>
          <button className="btn btn-ghost btn-sm">Agregar punto</button>
        </form>
      </div>

      <div className="card">
        <h2>Preguntas de ejemplo</h2>
        <p className="small muted">Usa {"{ciudad}"} donde va el cantón. Se sugieren al registrar consultas y se muestran en la página pública.</p>
        <ul>
          {questions.map((q) => (
            <li key={q.id} style={{ marginBottom: 6 }}>
              {q.text_es} {q.text_en && <span className="muted small">/ {q.text_en}</span>}{" "}
              <form action={deleteQuestionAction} className="inline-form">
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="category_id" value={cat.id} />
                <button className="btn btn-danger btn-sm" style={{ minHeight: 26, padding: "0 8px" }}>Quitar</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addQuestionAction} className="row-3" style={{ alignItems: "end" }}>
          <input type="hidden" name="category_id" value={cat.id} />
          <div className="field"><label htmlFor="q_es">Pregunta (ES)</label><input id="q_es" name="text_es" type="text" required placeholder="¿Dónde…en {ciudad}?" /></div>
          <div className="field"><label htmlFor="q_en">(EN)</label><input id="q_en" name="text_en" type="text" /></div>
          <button className="btn btn-ghost btn-sm">Agregar pregunta</button>
        </form>
      </div>
    </div>
  );
}
