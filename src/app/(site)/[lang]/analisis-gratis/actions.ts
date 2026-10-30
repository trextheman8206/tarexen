"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CONSENT_VERSION } from "@/config/site";
import { db } from "@/lib/db";
import { isLang } from "@/lib/i18n";
import { createBusiness, getCategoryBySlug } from "@/lib/repo";

export type SnapshotState = { attempt: number; errors: Record<string, string>; values: Record<string, string> };

// Límite simple en memoria por IP (suficiente para un prototipo con una instancia).
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null))
  .refine((v) => {
    if (v === null) return true;
    try {
      const u = new URL(v);
      return u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "url");

const schema = z
  .object({
    lang: z.enum(["es", "en"]),
    name: z.string().trim().min(2, "required").max(120),
    category: z.string().min(1, "required"),
    subcategory: z.string().optional(),
    other_industry: optionalText(120),
    province: z.string().regex(/^\d{2}$/, "required"),
    canton: z.string().regex(/^\d{4}$/, "required"),
    parish: z.string().optional(),
    parish_text: optionalText(120),
    neighborhood: optionalText(160),
    address: optionalText(240),
    has_location: z.string().optional(),
    in_person: z.string().optional(),
    online: z.string().optional(),
    delivery: z.string().optional(),
    delivery_area: optionalText(400),
    service_area: optionalText(400),
    nearby: optionalText(400),
    website: optionalUrl,
    gbp: optionalUrl,
    social: optionalText(1000),
    products: z.string().trim().min(3, "required").max(1500),
    target: optionalText(600),
    contact_name: z.string().trim().min(2, "required").max(120),
    email: z.union([z.literal(""), z.string().trim().email("email").max(200)]).optional(),
    whatsapp: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\+?[\d\s()-]{7,20}$/.test(v), "phone"),
    report_lang: z.enum(["es", "en"]),
    consent: z.literal("on", { errorMap: () => ({ message: "consent" }) }),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.whatsapp) ctx.addIssue({ code: "custom", path: ["email"], message: "contact" });
  });

const MESSAGES: Record<string, { es: string; en: string }> = {
  required: { es: "Este campo es obligatorio.", en: "This field is required." },
  url: { es: "Escribe un enlace válido (ej.: minegocio.com).", en: "Enter a valid link (e.g. mybusiness.com)." },
  email: { es: "Escribe un email válido.", en: "Enter a valid email." },
  phone: { es: "Escribe un número válido (ej.: 0991234567).", en: "Enter a valid number (e.g. +593 99 123 4567)." },
  contact: { es: "Deja al menos un email o un WhatsApp.", en: "Leave at least an email or WhatsApp." },
  consent: { es: "Necesitamos tu autorización para procesar tus datos.", en: "We need your consent to process your data." },
  location: { es: "Revisa la ubicación seleccionada.", en: "Check the selected location." },
  industry: { es: "Cuéntanos tu industria.", en: "Tell us your industry." },
  rate: { es: "Demasiados envíos seguidos. Intenta en unos minutos o escríbenos por WhatsApp.", en: "Too many submissions. Try again in a few minutes or message us on WhatsApp." },
  server: { es: "No pudimos guardar tu solicitud. Intenta de nuevo o escríbenos.", en: "We couldn't save your request. Please try again or contact us." },
};

export async function submitSnapshot(prev: SnapshotState, formData: FormData): Promise<SnapshotState> {
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string").map(([k, v]) => [k, v as string]),
  );
  const langRaw = raw.lang ?? "es";
  const lang = isLang(langRaw) ? langRaw : "es";
  const msg = (code: string) => (MESSAGES[code] ?? MESSAGES.required)[lang];
  const fail = (errors: Record<string, string>): SnapshotState => ({ attempt: prev.attempt + 1, errors, values: raw });

  // Honeypot: los bots llenan este campo oculto. Respondemos como éxito sin guardar.
  if (raw.company_url) redirect(`/${lang}/gracias`);

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (rateLimited(ip)) return fail({ _form: msg("rate") });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      if (!errors[key]) errors[key] = msg(issue.message);
    }
    return fail(errors);
  }
  const v = parsed.data;

  const category = await getCategoryBySlug(v.category);
  if (!category || !category.active) return fail({ category: msg("required") });
  if (category.slug === "otros" && !v.other_industry) return fail({ other_industry: msg("industry") });

  // Verificar que la ubicación y la subcategoría sean coherentes.
  const c = await db();
  const canton = await c.execute({ sql: "SELECT 1 FROM cantons WHERE code = ? AND province_code = ?", args: [v.canton, v.province] });
  if (!canton.rows.length) return fail({ canton: msg("location") });
  let parishId: number | null = null;
  if (v.parish && v.parish !== "other") {
    const p = await c.execute({ sql: "SELECT id FROM parishes WHERE id = ? AND canton_code = ?", args: [Number(v.parish), v.canton] });
    if (!p.rows.length) return fail({ parish: msg("location") });
    parishId = Number(p.rows[0].id);
  }
  let subId: number | null = null;
  if (v.subcategory) {
    const s = await c.execute({ sql: "SELECT id FROM subcategories WHERE id = ? AND category_id = ? AND active = 1", args: [Number(v.subcategory), category.id] });
    if (s.rows.length) subId = Number(s.rows[0].id);
  }

  try {
    await createBusiness({
      name: v.name,
      category_id: category.id,
      subcategory_id: subId,
      other_industry: v.other_industry,
      province_code: v.province,
      canton_code: v.canton,
      parish_id: parishId,
      parish_text: v.parish_text,
      neighborhood: v.neighborhood,
      address: v.address,
      website: v.website,
      gbp_url: v.gbp,
      social_links: v.social,
      contact_name: v.contact_name,
      contact_email: v.email || null,
      contact_whatsapp: v.whatsapp || null,
      products_services: v.products,
      target_customers: v.target,
      has_physical_location: v.has_location ? 1 : 0,
      serves_in_person: v.in_person ? 1 : 0,
      serves_online: v.online ? 1 : 0,
      offers_delivery: v.delivery ? 1 : 0,
      delivery_area: v.delivery_area,
      service_area: v.service_area,
      nearby_cities: v.nearby,
      preferred_lang: v.report_lang,
      consent_at: new Date().toISOString(),
      consent_version: CONSENT_VERSION,
      source: raw.plan ? `web:${raw.plan}` : "web",
    });
  } catch (err) {
    console.error("[snapshot] no se pudo guardar", err);
    return fail({ _form: msg("server") });
  }

  redirect(`/${lang}/gracias`);
}
