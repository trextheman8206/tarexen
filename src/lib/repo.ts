import "server-only";
import { db, plain } from "./db";

export type Category = {
  id: number; slug: string; name_es: string; name_en: string;
  description_es: string; description_en: string; icon: string; sort: number; active: number;
};
export type Subcategory = { id: number; category_id: number; name_es: string; name_en: string; active: number };
export type ChecklistItem = {
  id: number; category_id: number | null; key: string; label_es: string; label_en: string;
  weight: number; sort: number; active: number;
};
export type ExampleQuestion = { id: number; category_id: number; text_es: string; text_en: string };
export type Province = { code: string; name: string };
export type Canton = { code: string; province_code: string; name: string };
export type Parish = { id: number; canton_code: string; name: string; kind: string };

export const BUSINESS_STATUSES = ["nuevo", "contactado", "snapshot_enviado", "propuesta", "cliente", "perdido"] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export type Business = {
  id: number; name: string; category_id: number | null; subcategory_id: number | null; other_industry: string | null;
  province_code: string | null; canton_code: string | null; parish_id: number | null; parish_text: string | null;
  neighborhood: string | null; address: string | null; website: string | null; gbp_url: string | null;
  social_links: string | null; contact_name: string; contact_email: string | null; contact_whatsapp: string | null;
  products_services: string | null; target_customers: string | null;
  has_physical_location: number; serves_in_person: number; serves_online: number; offers_delivery: number;
  delivery_area: string | null; service_area: string | null; nearby_cities: string | null;
  preferred_lang: "es" | "en"; consent_at: string; consent_version: string; source: string; is_demo: number;
  status: BusinessStatus; notes: string; created_at: string; updated_at: string;
};
export type BusinessRow = Business & {
  category_name: string | null; category_name_en: string | null; category_slug: string | null; subcategory_name: string | null; subcategory_name_en: string | null;
  province_name: string | null; canton_name: string | null; parish_name: string | null;
};

export type Audit = {
  id: number; business_id: number; kind: "snapshot" | "full" | "followup";
  status: "borrador" | "en_progreso" | "completada"; parent_audit_id: number | null;
  report_lang: "es" | "en"; summary: string; created_at: string; completed_at: string | null;
};
export type AuditQuery = {
  id: number; audit_id: number; question: string; platform: string; method: "manual" | "api"; tested_at: string;
  appeared: "si" | "no" | "parcial"; position: number | null; businesses_mentioned: string; competitors: string;
  sources_cited: string; raw_answer: string; observations: string; retest_of_id: number | null; created_at: string;
};
export type AuditCheck = { audit_id: number; checklist_item_id: number; result: CheckResult; evidence: string };
export type CheckResult = "cumple" | "parcial" | "no_cumple" | "desconocido";
export type Recommendation = {
  id: number; audit_id: number; area: string; text: string; basis: "hallazgo" | "supuesto";
  basis_ref: string; priority: "alta" | "media" | "baja"; created_at: string;
};
export type Payment = {
  id: number; business_id: number; amount_usd: number; plan: string; method: string;
  invoice_ref: string; paid_at: string; note: string;
};

// ---------- Categorías ----------

export async function listCategories(opts: { activeOnly?: boolean } = {}) {
  const c = await db();
  const rs = await c.execute(
    `SELECT * FROM categories ${opts.activeOnly ? "WHERE active = 1" : ""} ORDER BY sort, id`,
  );
  return plain<Category>(rs);
}

export async function getCategoryBySlug(slug: string) {
  const c = await db();
  return plain<Category>(await c.execute({ sql: "SELECT * FROM categories WHERE slug = ?", args: [slug] }))[0] ?? null;
}

export async function getCategory(id: number) {
  const c = await db();
  return plain<Category>(await c.execute({ sql: "SELECT * FROM categories WHERE id = ?", args: [id] }))[0] ?? null;
}

export async function listSubcategories(categoryId?: number, activeOnly = false) {
  const c = await db();
  const where: string[] = [];
  const args: (number | string)[] = [];
  if (categoryId) { where.push("category_id = ?"); args.push(categoryId); }
  if (activeOnly) where.push("active = 1");
  const rs = await c.execute({
    sql: `SELECT * FROM subcategories ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY name_es`,
    args,
  });
  return plain<Subcategory>(rs);
}

/** Ítems base (category_id NULL) + ítems propios de la categoría. */
export async function listChecklist(categoryId: number | null, activeOnly = true) {
  const c = await db();
  const rs = await c.execute({
    sql: `SELECT * FROM checklist_items
          WHERE (category_id IS NULL OR category_id = ?) ${activeOnly ? "AND active = 1" : ""}
          ORDER BY category_id IS NOT NULL, sort, id`,
    args: [categoryId ?? -1],
  });
  return plain<ChecklistItem>(rs);
}

export async function listQuestions(categoryId: number) {
  const c = await db();
  return plain<ExampleQuestion>(
    await c.execute({ sql: "SELECT * FROM example_questions WHERE category_id = ? ORDER BY id", args: [categoryId] }),
  );
}

// ---------- Ubicaciones ----------

export async function listProvinces() {
  const c = await db();
  return plain<Province>(await c.execute("SELECT * FROM provinces ORDER BY name"));
}

export async function listCantons() {
  const c = await db();
  return plain<Canton>(await c.execute("SELECT * FROM cantons ORDER BY name"));
}

export async function listParishes(cantonCode: string) {
  const c = await db();
  return plain<Parish>(
    await c.execute({ sql: "SELECT * FROM parishes WHERE canton_code = ? ORDER BY kind DESC, name", args: [cantonCode] }),
  );
}

// ---------- Negocios ----------

const BUSINESS_SELECT = `
  SELECT b.*, cat.name_es AS category_name, cat.name_en AS category_name_en, cat.slug AS category_slug, s.name_es AS subcategory_name, s.name_en AS subcategory_name_en,
         p.name AS province_name, cn.name AS canton_name, pa.name AS parish_name
  FROM businesses b
  LEFT JOIN categories cat ON cat.id = b.category_id
  LEFT JOIN subcategories s ON s.id = b.subcategory_id
  LEFT JOIN provinces p ON p.code = b.province_code
  LEFT JOIN cantons cn ON cn.code = b.canton_code
  LEFT JOIN parishes pa ON pa.id = b.parish_id`;

export type NewBusiness = Omit<Business, "id" | "status" | "notes" | "created_at" | "updated_at" | "is_demo"> & { is_demo?: number };

export async function createBusiness(b: NewBusiness) {
  const c = await db();
  const cols = Object.keys(b) as (keyof NewBusiness)[];
  const rs = await c.execute({
    sql: `INSERT INTO businesses (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    args: cols.map((k) => (b[k] ?? null) as string | number | null),
  });
  return Number(rs.lastInsertRowid);
}

export async function listBusinesses(filter: { status?: string; categoryId?: number; q?: string } = {}) {
  const c = await db();
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filter.status) { where.push("b.status = ?"); args.push(filter.status); }
  if (filter.categoryId) { where.push("b.category_id = ?"); args.push(filter.categoryId); }
  if (filter.q) { where.push("(b.name LIKE ? OR b.contact_name LIKE ? OR cn.name LIKE ?)"); const q = `%${filter.q}%`; args.push(q, q, q); }
  const rs = await c.execute({
    sql: `${BUSINESS_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY b.created_at DESC, b.id DESC LIMIT 500`,
    args,
  });
  return plain<BusinessRow>(rs);
}

export async function getBusiness(id: number) {
  const c = await db();
  return plain<BusinessRow>(await c.execute({ sql: `${BUSINESS_SELECT} WHERE b.id = ?`, args: [id] }))[0] ?? null;
}

export async function updateBusinessStatus(id: number, status: BusinessStatus, notes: string) {
  const c = await db();
  await c.execute({
    sql: "UPDATE businesses SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, notes, id],
  });
}

// ---------- Auditorías ----------

export async function createAudit(businessId: number, kind: Audit["kind"], lang: "es" | "en", parentId: number | null = null) {
  const c = await db();
  const rs = await c.execute({
    sql: "INSERT INTO audits (business_id, kind, report_lang, parent_audit_id) VALUES (?, ?, ?, ?)",
    args: [businessId, kind, lang, parentId],
  });
  return Number(rs.lastInsertRowid);
}

export async function getAudit(id: number) {
  const c = await db();
  return plain<Audit>(await c.execute({ sql: "SELECT * FROM audits WHERE id = ?", args: [id] }))[0] ?? null;
}

export async function listAuditsForBusiness(businessId: number) {
  const c = await db();
  return plain<Audit & { query_count: number; appeared_count: number }>(
    await c.execute({
      sql: `SELECT a.*,
              (SELECT COUNT(*) FROM audit_queries q WHERE q.audit_id = a.id) AS query_count,
              (SELECT COUNT(*) FROM audit_queries q WHERE q.audit_id = a.id AND q.appeared = 'si') AS appeared_count
            FROM audits a WHERE a.business_id = ? ORDER BY a.created_at DESC, a.id DESC`,
      args: [businessId],
    }),
  );
}

export async function updateAudit(id: number, fields: { summary: string; status: Audit["status"]; report_lang: "es" | "en" }) {
  const c = await db();
  await c.execute({
    sql: `UPDATE audits SET summary = ?, status = ?, report_lang = ?,
            completed_at = CASE WHEN ? = 'completada' THEN COALESCE(completed_at, datetime('now')) ELSE NULL END
          WHERE id = ?`,
    args: [fields.summary, fields.status, fields.report_lang, fields.status, id],
  });
}

export async function listQueries(auditId: number) {
  const c = await db();
  return plain<AuditQuery>(
    await c.execute({ sql: "SELECT * FROM audit_queries WHERE audit_id = ? ORDER BY tested_at, id", args: [auditId] }),
  );
}

export async function getQuery(id: number) {
  const c = await db();
  return plain<AuditQuery>(await c.execute({ sql: "SELECT * FROM audit_queries WHERE id = ?", args: [id] }))[0] ?? null;
}

export async function addQuery(q: Omit<AuditQuery, "id" | "created_at">) {
  const c = await db();
  const cols = Object.keys(q) as (keyof typeof q)[];
  await c.execute({
    sql: `INSERT INTO audit_queries (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    args: cols.map((k) => q[k] as string | number | null),
  });
}

export async function deleteQuery(id: number, auditId: number) {
  const c = await db();
  await c.batch(
    [
      { sql: "UPDATE audit_queries SET retest_of_id = NULL WHERE retest_of_id = ?", args: [id] },
      { sql: "DELETE FROM audit_queries WHERE id = ? AND audit_id = ?", args: [id, auditId] },
    ],
    "write",
  );
}

export async function listChecks(auditId: number) {
  const c = await db();
  return plain<AuditCheck>(await c.execute({ sql: "SELECT * FROM audit_checks WHERE audit_id = ?", args: [auditId] }));
}

export async function saveChecks(auditId: number, checks: { itemId: number; result: CheckResult; evidence: string }[]) {
  const c = await db();
  if (!checks.length) return;
  await c.batch(
    checks.map((ch) => ({
      sql: `INSERT INTO audit_checks (audit_id, checklist_item_id, result, evidence) VALUES (?, ?, ?, ?)
            ON CONFLICT (audit_id, checklist_item_id) DO UPDATE SET result = excluded.result, evidence = excluded.evidence`,
      args: [auditId, ch.itemId, ch.result, ch.evidence],
    })),
    "write",
  );
}

export async function listRecommendations(auditId: number) {
  const c = await db();
  return plain<Recommendation>(
    await c.execute({
      sql: `SELECT * FROM recommendations WHERE audit_id = ?
            ORDER BY CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, id`,
      args: [auditId],
    }),
  );
}

export async function addRecommendation(r: Omit<Recommendation, "id" | "created_at">) {
  const c = await db();
  await c.execute({
    sql: "INSERT INTO recommendations (audit_id, area, text, basis, basis_ref, priority) VALUES (?, ?, ?, ?, ?, ?)",
    args: [r.audit_id, r.area, r.text, r.basis, r.basis_ref, r.priority],
  });
}

export async function deleteRecommendation(id: number, auditId: number) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM recommendations WHERE id = ? AND audit_id = ?", args: [id, auditId] });
}

// ---------- Pagos ----------

export async function listPayments(businessId: number) {
  const c = await db();
  return plain<Payment>(
    await c.execute({ sql: "SELECT * FROM payments WHERE business_id = ? ORDER BY paid_at DESC", args: [businessId] }),
  );
}

export async function addPayment(p: Omit<Payment, "id">) {
  const c = await db();
  await c.execute({
    sql: "INSERT INTO payments (business_id, amount_usd, plan, method, invoice_ref, paid_at, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [p.business_id, p.amount_usd, p.plan, p.method, p.invoice_ref, p.paid_at, p.note],
  });
}

// ---------- Panel ----------

export async function dashboardStats() {
  const c = await db();
  const [byStatus, audits, revenue, due, recent] = await Promise.all([
    c.execute("SELECT status, COUNT(*) AS n FROM businesses WHERE is_demo = 0 GROUP BY status"),
    c.execute("SELECT status, COUNT(*) AS n FROM audits GROUP BY status"),
    c.execute(`SELECT COALESCE(SUM(p.amount_usd), 0) AS total,
                      COALESCE(SUM(CASE WHEN p.paid_at >= date('now', 'start of month') THEN p.amount_usd END), 0) AS month
               FROM payments p JOIN businesses b ON b.id = p.business_id WHERE b.is_demo = 0`),
    // Auditorías completadas hace 25+ días sin re-medición: recordatorio de seguimiento.
    c.execute(`SELECT a.id, a.completed_at, b.name AS business_name, b.id AS business_id
               FROM audits a JOIN businesses b ON b.id = a.business_id
               WHERE a.status = 'completada' AND a.kind != 'followup'
                 AND a.completed_at <= datetime('now', '-25 days')
                 AND NOT EXISTS (SELECT 1 FROM audits f WHERE f.parent_audit_id = a.id)
               ORDER BY a.completed_at`),
    c.execute(`${BUSINESS_SELECT} ORDER BY b.created_at DESC, b.id DESC LIMIT 8`),
  ]);
  return {
    byStatus: Object.fromEntries(plain<{ status: string; n: number }>(byStatus).map((r) => [r.status, r.n])) as Record<string, number>,
    audits: Object.fromEntries(plain<{ status: string; n: number }>(audits).map((r) => [r.status, r.n])) as Record<string, number>,
    revenue: plain<{ total: number; month: number }>(revenue)[0],
    followupsDue: plain<{ id: number; completed_at: string; business_name: string; business_id: number }>(due),
    recent: plain<BusinessRow>(recent),
  };
}
