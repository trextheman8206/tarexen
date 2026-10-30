"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PLATFORMS, REC_AREAS } from "@/config/site";
import { actorLabel, adminConfigured, authenticate, endSession, requirePerm, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INVITABLE_ROLES } from "@/lib/roles";
import { acceptInvitation, createInvitation, MIN_PASSWORD, revokeInvitation, updateMember } from "@/lib/team";
import {
  addPayment, addQuery, addRecommendation, BUSINESS_STATUSES, createAudit, createBusiness, deleteQuery,
  deleteRecommendation, getAudit, listChecklist, getBusiness, saveChecks, updateAudit, updateBusinessStatus,
  type CheckResult,
} from "@/lib/repo";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Parámetro inválido: ${k}`);
  return n;
};

// ---------- Sesión ----------

const loginAttempts = new Map<string, number[]>();

export async function login(_: { error: string } | null, fd: FormData) {
  if (!adminConfigured()) return { error: "El panel no está configurado: define ADMIN_PASSWORD y SESSION_SECRET (32+ caracteres) en .env.local." };
  const email = str(fd, "email").toLowerCase().slice(0, 200);
  const key = email || "dueno";
  const now = Date.now();
  const recent = (loginAttempts.get(key) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 10) return { error: "Demasiados intentos. Espera 15 minutos." };
  const user = await authenticate(email, String(fd.get("password") ?? ""));
  if (!user) {
    recent.push(now);
    loginAttempts.set(key, recent);
    return { error: "Email o contraseña incorrectos." };
  }
  loginAttempts.delete(key);
  await startSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Equipo ----------

const inviteRole = z.enum(INVITABLE_ROLES as ["gerente", "auditor", "ventas", "lectura"]);

export async function createInviteAction(fd: FormData) {
  const user = await requirePerm("team.manage");
  const token = await createInvitation(inviteRole.parse(str(fd, "role")), str(fd, "note").slice(0, 200), actorLabel(user));
  // El enlace solo se muestra una vez (en la base se guarda su hash).
  redirect(`/admin/equipo?nueva=${encodeURIComponent(token)}`);
}

export async function revokeInviteAction(fd: FormData) {
  await requirePerm("team.manage");
  await revokeInvitation(int(fd, "id"));
  revalidatePath("/admin/equipo");
}

export async function updateMemberAction(fd: FormData) {
  await requirePerm("team.manage");
  const id = int(fd, "id");
  const role = str(fd, "role");
  await updateMember(id, {
    role: role ? inviteRole.parse(role) : undefined,
    active: fd.has("active") ? str(fd, "active") === "1" : undefined,
  });
  revalidatePath("/admin/equipo");
}

export type JoinState = { error: string; values: { name: string; email: string }; done?: boolean } | null;

/** Pública: la usa quien recibió el enlace de invitación. */
export async function acceptInviteAction(_: JoinState, fd: FormData): Promise<JoinState> {
  const token = str(fd, "token");
  const name = str(fd, "name").slice(0, 120);
  const email = str(fd, "email").toLowerCase().slice(0, 200);
  const password = String(fd.get("password") ?? "");
  const values = { name, email };
  if (name.length < 2) return { error: "Escribe tu nombre.", values };
  if (!z.string().email().safeParse(email).success) return { error: "Escribe un email válido.", values };
  if (password.length < MIN_PASSWORD) return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`, values };
  if (password !== String(fd.get("password2") ?? "")) return { error: "Las contraseñas no coinciden.", values };
  const res = await acceptInvitation(token, name, email, password);
  if (!res.ok) {
    return {
      error: res.error === "email_taken" ? "Ese email ya tiene una cuenta en el equipo." : "La invitación no es válida, ya se usó o venció. Pide una nueva.",
      values,
    };
  }
  await startSession(res.memberId);
  // La navegación al panel la hace el cliente (ver JoinForm): con redirect() aquí,
  // el navegador terminaba en el sitio público en vez del panel.
  return { error: "", values, done: true };
}

// ---------- Negocios ----------

export async function updateBusinessAction(fd: FormData) {
  await requirePerm('leads.edit');
  const id = int(fd, "id");
  const status = z.enum(BUSINESS_STATUSES).parse(str(fd, "status"));
  await updateBusinessStatus(id, status, str(fd, "notes").slice(0, 5000));
  revalidatePath(`/admin/negocios/${id}`);
}

export async function addPaymentAction(fd: FormData) {
  await requirePerm('payments.manage');
  const business_id = int(fd, "business_id");
  const amount = Number(str(fd, "amount_usd"));
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Monto inválido");
  await addPayment({
    business_id,
    amount_usd: Math.round(amount * 100) / 100,
    plan: z.enum(["business", "pro", "otro"]).parse(str(fd, "plan")),
    method: str(fd, "method").slice(0, 60) || "transferencia",
    invoice_ref: str(fd, "invoice_ref").slice(0, 80),
    paid_at: str(fd, "paid_at") || new Date().toISOString().slice(0, 10),
    note: str(fd, "note").slice(0, 500),
  });
  revalidatePath(`/admin/negocios/${business_id}`);
}

/** Datos DEMO claramente marcados para enseñar el flujo sin inventar clientes reales. */
export async function createDemoAction() {
  await requirePerm('demo.create');
  const c = await db();
  const cat = (await c.execute("SELECT id FROM categories WHERE slug = 'restaurantes'")).rows[0];
  const id = await createBusiness({
    name: "DEMO — Restaurante Ejemplo (ficticio)",
    category_id: cat ? Number(cat.id) : null,
    subcategory_id: null, other_industry: null,
    province_code: "10", canton_code: "1003", parish_id: null, parish_text: "El Sagrario",
    neighborhood: null, address: null, website: null, gbp_url: null, social_links: null,
    contact_name: "Contacto demo", contact_email: null, contact_whatsapp: null,
    products_services: "Comida típica (dato demo)", target_customers: "Turistas y familias (dato demo)",
    has_physical_location: 1, serves_in_person: 1, serves_online: 0, offers_delivery: 0,
    delivery_area: null, service_area: null, nearby_cities: null, preferred_lang: "es",
    consent_at: new Date().toISOString(), consent_version: "demo", source: "demo", is_demo: 1,
  });
  const auditId = await createAudit(id, "snapshot", "es");
  const now = new Date().toISOString().slice(0, 16);
  const demo = "DATO DEMO — respuesta ficticia, no es una consulta real.";
  await addQuery({ audit_id: auditId, question: "¿Cuál es el mejor restaurante en Cotacachi?", platform: "chatgpt", method: "manual", tested_at: now, appeared: "no", position: null, businesses_mentioned: "Competidor A (ficticio)\nCompetidor B (ficticio)", competitors: "Competidor A (ficticio)\nCompetidor B (ficticio)", sources_cited: "", raw_answer: demo, observations: demo, retest_of_id: null });
  await addQuery({ audit_id: auditId, question: "¿Dónde comer comida típica en Cotacachi?", platform: "gemini", method: "manual", tested_at: now, appeared: "parcial", position: 3, businesses_mentioned: "Competidor A (ficticio)\nDEMO — Restaurante Ejemplo", competitors: "Competidor A (ficticio)", sources_cited: "", raw_answer: demo, observations: demo, retest_of_id: null });
  redirect(`/admin/auditorias/${auditId}`);
}

// ---------- Auditorías ----------

export async function createAuditAction(fd: FormData) {
  await requirePerm('audits.edit');
  const businessId = int(fd, "business_id");
  const biz = await getBusiness(businessId);
  if (!biz) throw new Error("Negocio no encontrado");
  const kind = z.enum(["snapshot", "full"]).parse(str(fd, "kind"));
  const id = await createAudit(businessId, kind, biz.preferred_lang);
  redirect(`/admin/auditorias/${id}`);
}

export async function createFollowupAction(fd: FormData) {
  await requirePerm('audits.edit');
  const parent = await getAudit(int(fd, "audit_id"));
  if (!parent) throw new Error("Auditoría no encontrada");
  const id = await createAudit(parent.business_id, "followup", parent.report_lang, parent.id);
  redirect(`/admin/auditorias/${id}`);
}

const platformIds = PLATFORMS.map((p) => p.id) as [string, ...string[]];

export async function addQueryAction(fd: FormData) {
  await requirePerm('audits.edit');
  const auditId = int(fd, "audit_id");
  const retest = Number(fd.get("retest_of_id")) || null;
  const position = Number(fd.get("position")) || null;
  const testedAt = str(fd, "tested_at");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(testedAt)) throw new Error("Fecha y hora inválidas");
  const question = str(fd, "question");
  if (question.length < 5) throw new Error("La pregunta es obligatoria");
  await addQuery({
    audit_id: auditId,
    question: question.slice(0, 500),
    platform: z.enum(platformIds).parse(str(fd, "platform")),
    // Sin conectores de API implementados, toda consulta registrada es manual.
    method: "manual",
    tested_at: testedAt.slice(0, 16),
    appeared: z.enum(["si", "no", "parcial"]).parse(str(fd, "appeared")),
    position,
    businesses_mentioned: str(fd, "businesses_mentioned").slice(0, 3000),
    competitors: str(fd, "competitors").slice(0, 3000),
    sources_cited: str(fd, "sources_cited").slice(0, 3000),
    raw_answer: str(fd, "raw_answer").slice(0, 20000),
    observations: str(fd, "observations").slice(0, 3000),
    retest_of_id: retest,
  });
  const audit = await getAudit(auditId);
  if (audit?.status === "borrador") await updateAudit(auditId, { summary: audit.summary, status: "en_progreso", report_lang: audit.report_lang });
  redirect(`/admin/auditorias/${auditId}#consultas`);
}

export async function deleteQueryAction(fd: FormData) {
  await requirePerm('audits.edit');
  const auditId = int(fd, "audit_id");
  await deleteQuery(int(fd, "id"), auditId);
  revalidatePath(`/admin/auditorias/${auditId}`);
}

const RESULTS: CheckResult[] = ["cumple", "parcial", "no_cumple", "desconocido"];

export async function saveChecksAction(fd: FormData) {
  await requirePerm('audits.edit');
  const auditId = int(fd, "audit_id");
  const audit = await getAudit(auditId);
  if (!audit) throw new Error("Auditoría no encontrada");
  const biz = await getBusiness(audit.business_id);
  const items = await listChecklist(biz?.category_id ?? null);
  const checks = items
    .map((it) => ({ itemId: it.id, result: str(fd, `result_${it.id}`) as CheckResult, evidence: str(fd, `evidence_${it.id}`).slice(0, 1000) }))
    .filter((c) => RESULTS.includes(c.result));
  await saveChecks(auditId, checks);
  revalidatePath(`/admin/auditorias/${auditId}`);
}

export async function addRecommendationAction(fd: FormData) {
  await requirePerm('audits.edit');
  const auditId = int(fd, "audit_id");
  const text = str(fd, "text");
  if (text.length < 5) throw new Error("La recomendación está vacía");
  const basis = z.enum(["hallazgo", "supuesto"]).parse(str(fd, "basis"));
  const basisRef = str(fd, "basis_ref").slice(0, 500);
  if (basis === "hallazgo" && !basisRef) throw new Error("Una recomendación basada en un hallazgo debe indicar cuál (consulta o checklist).");
  await addRecommendation({
    audit_id: auditId,
    area: z.enum(REC_AREAS.map((a) => a.id) as [string, ...string[]]).parse(str(fd, "area")),
    text: text.slice(0, 4000),
    basis,
    basis_ref: basisRef,
    priority: z.enum(["alta", "media", "baja"]).parse(str(fd, "priority")),
  });
  redirect(`/admin/auditorias/${auditId}#recomendaciones`);
}

export async function deleteRecommendationAction(fd: FormData) {
  await requirePerm('audits.edit');
  const auditId = int(fd, "audit_id");
  await deleteRecommendation(int(fd, "id"), auditId);
  revalidatePath(`/admin/auditorias/${auditId}`);
}

export async function updateAuditAction(fd: FormData) {
  await requirePerm('audits.edit');
  const id = int(fd, "audit_id");
  await updateAudit(id, {
    summary: str(fd, "summary").slice(0, 6000),
    status: z.enum(["borrador", "en_progreso", "completada"]).parse(str(fd, "status")),
    report_lang: z.enum(["es", "en"]).parse(str(fd, "report_lang")),
  });
  revalidatePath(`/admin/auditorias/${id}`);
}

// ---------- Categorías (editables sin tocar código) ----------

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export async function createCategoryAction(fd: FormData) {
  await requirePerm('categories.manage');
  const nameEs = str(fd, "name_es");
  const nameEn = str(fd, "name_en") || nameEs;
  const slug = slugify(str(fd, "slug") || nameEs);
  if (nameEs.length < 2 || !slug) throw new Error("Nombre obligatorio");
  const c = await db();
  const exists = await c.execute({ sql: "SELECT 1 FROM categories WHERE slug = ?", args: [slug] });
  if (exists.rows.length) throw new Error(`Ya existe una categoría con el slug "${slug}"`);
  const rs = await c.execute({
    sql: "INSERT INTO categories (slug, name_es, name_en, icon, sort) VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM categories))",
    args: [slug, nameEs, nameEn, str(fd, "icon").slice(0, 8) || "•"],
  });
  redirect(`/admin/categorias/${Number(rs.lastInsertRowid)}`);
}

export async function updateCategoryAction(fd: FormData) {
  await requirePerm('categories.manage');
  const id = int(fd, "id");
  const c = await db();
  await c.execute({
    sql: `UPDATE categories SET name_es = ?, name_en = ?, description_es = ?, description_en = ?, icon = ?, sort = ?, active = ? WHERE id = ?`,
    args: [
      str(fd, "name_es"), str(fd, "name_en"), str(fd, "description_es").slice(0, 1000), str(fd, "description_en").slice(0, 1000),
      str(fd, "icon").slice(0, 8), Number(str(fd, "sort")) || 0, fd.get("active") ? 1 : 0, id,
    ],
  });
  revalidatePath(`/admin/categorias/${id}`);
  revalidatePath("/admin/categorias");
}

export async function addSubcategoryAction(fd: FormData) {
  await requirePerm('categories.manage');
  const categoryId = int(fd, "category_id");
  const es = str(fd, "name_es");
  if (es.length < 2) throw new Error("Nombre obligatorio");
  const c = await db();
  await c.execute({ sql: "INSERT INTO subcategories (category_id, name_es, name_en) VALUES (?, ?, ?)", args: [categoryId, es, str(fd, "name_en") || es] });
  revalidatePath(`/admin/categorias/${categoryId}`);
}

export async function toggleSubcategoryAction(fd: FormData) {
  await requirePerm('categories.manage');
  const c = await db();
  await c.execute({ sql: "UPDATE subcategories SET active = 1 - active WHERE id = ?", args: [int(fd, "id")] });
  revalidatePath(`/admin/categorias/${int(fd, "category_id")}`);
}

export async function addChecklistItemAction(fd: FormData) {
  await requirePerm('categories.manage');
  const categoryId = int(fd, "category_id");
  const es = str(fd, "label_es");
  if (es.length < 3) throw new Error("Texto obligatorio");
  const weight = Math.min(5, Math.max(1, Number(str(fd, "weight")) || 1));
  const c = await db();
  await c.execute({
    sql: "INSERT INTO checklist_items (category_id, key, label_es, label_en, weight, sort) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort), 100) + 1 FROM checklist_items WHERE category_id = ?))",
    args: [categoryId, slugify(es).slice(0, 40), es, str(fd, "label_en") || es, weight, categoryId],
  });
  revalidatePath(`/admin/categorias/${categoryId}`);
}

export async function updateChecklistItemAction(fd: FormData) {
  await requirePerm('categories.manage');
  const c = await db();
  const weight = Math.min(5, Math.max(1, Number(str(fd, "weight")) || 1));
  await c.execute({
    sql: "UPDATE checklist_items SET label_es = ?, label_en = ?, weight = ?, active = ? WHERE id = ?",
    args: [str(fd, "label_es"), str(fd, "label_en"), weight, fd.get("active") ? 1 : 0, int(fd, "id")],
  });
  revalidatePath(`/admin/categorias/${str(fd, "category_id")}`);
}

export async function addQuestionAction(fd: FormData) {
  await requirePerm('categories.manage');
  const categoryId = int(fd, "category_id");
  const es = str(fd, "text_es");
  if (es.length < 5) throw new Error("Pregunta obligatoria");
  const c = await db();
  await c.execute({ sql: "INSERT INTO example_questions (category_id, text_es, text_en) VALUES (?, ?, ?)", args: [categoryId, es, str(fd, "text_en")] });
  revalidatePath(`/admin/categorias/${categoryId}`);
}

export async function deleteQuestionAction(fd: FormData) {
  await requirePerm('categories.manage');
  const c = await db();
  await c.execute({ sql: "DELETE FROM example_questions WHERE id = ?", args: [int(fd, "id")] });
  revalidatePath(`/admin/categorias/${int(fd, "category_id")}`);
}
