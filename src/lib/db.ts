import "server-only";
import { createClient, type Client, type InStatement, type ResultSet } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { BASE_CHECKS, CATEGORIES } from "./seed/categories";
import { PROVINCES, SAMPLE_PARISHES } from "./seed/ecuador";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_sub_cat ON subcategories(category_id);
CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 5),
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_check_cat ON checklist_items(category_id);
CREATE TABLE IF NOT EXISTS example_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  text_es TEXT NOT NULL,
  text_en TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_q_cat ON example_questions(category_id);

CREATE TABLE IF NOT EXISTS provinces (code TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cantons (
  code TEXT PRIMARY KEY,
  province_code TEXT NOT NULL REFERENCES provinces(code),
  name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_canton_prov ON cantons(province_code);
CREATE TABLE IF NOT EXISTS parishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  canton_code TEXT NOT NULL REFERENCES cantons(code),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'rural' CHECK (kind IN ('urbana','rural')),
  UNIQUE (canton_code, name)
);

CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id),
  other_industry TEXT,
  province_code TEXT REFERENCES provinces(code),
  canton_code TEXT REFERENCES cantons(code),
  parish_id INTEGER REFERENCES parishes(id),
  parish_text TEXT,
  neighborhood TEXT,
  address TEXT,
  website TEXT,
  gbp_url TEXT,
  social_links TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_whatsapp TEXT,
  products_services TEXT,
  target_customers TEXT,
  has_physical_location INTEGER NOT NULL DEFAULT 1,
  serves_in_person INTEGER NOT NULL DEFAULT 1,
  serves_online INTEGER NOT NULL DEFAULT 0,
  offers_delivery INTEGER NOT NULL DEFAULT 0,
  delivery_area TEXT,
  service_area TEXT,
  nearby_cities TEXT,
  preferred_lang TEXT NOT NULL DEFAULT 'es' CHECK (preferred_lang IN ('es','en')),
  consent_at TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  is_demo INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (status IN ('nuevo','contactado','snapshot_enviado','propuesta','cliente','perdido')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_biz_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_biz_cat ON businesses(category_id);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('snapshot','full','followup')),
  status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador','en_progreso','completada')),
  parent_audit_id INTEGER REFERENCES audits(id),
  report_lang TEXT NOT NULL DEFAULT 'es' CHECK (report_lang IN ('es','en')),
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_biz ON audits(business_id);

CREATE TABLE IF NOT EXISTS audit_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  platform TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('manual','api')),
  tested_at TEXT NOT NULL,
  appeared TEXT NOT NULL CHECK (appeared IN ('si','no','parcial')),
  position INTEGER,
  businesses_mentioned TEXT NOT NULL DEFAULT '',
  competitors TEXT NOT NULL DEFAULT '',
  sources_cited TEXT NOT NULL DEFAULT '',
  raw_answer TEXT NOT NULL DEFAULT '',
  observations TEXT NOT NULL DEFAULT '',
  retest_of_id INTEGER REFERENCES audit_queries(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_q_audit ON audit_queries(audit_id);

CREATE TABLE IF NOT EXISTS audit_checks (
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),
  result TEXT NOT NULL CHECK (result IN ('cumple','parcial','no_cumple','desconocido')),
  evidence TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (audit_id, checklist_item_id)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  text TEXT NOT NULL,
  basis TEXT NOT NULL CHECK (basis IN ('hallazgo','supuesto')),
  basis_ref TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta','media','baja')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rec_audit ON recommendations(audit_id);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount_usd REAL NOT NULL CHECK (amount_usd >= 0),
  plan TEXT NOT NULL,
  method TEXT NOT NULL,
  invoice_ref TEXT NOT NULL DEFAULT '',
  paid_at TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_pay_biz ON payments(business_id);
`;

type Global = { __tarexenDb?: Client; __tarexenReady?: Promise<void> };
const g = globalThis as Global;

/** Limpia valores pegados en paneles de hosting: espacios, saltos de línea y comillas envolventes. */
function envValue(name: string): string | undefined {
  const v = process.env[name]?.trim().replace(/^(["'])(.*)\1$/, "$2").trim();
  return v || undefined;
}

function client(): Client {
  if (!g.__tarexenDb) {
    const url = envValue("DATABASE_URL") || "file:data/tarexen.db";
    if (url.startsWith("file:")) {
      if (process.env.NODE_ENV === "production" && process.env.NETLIFY) {
        throw new Error("DATABASE_URL no está configurada en el hosting.");
      }
      mkdirSync("data", { recursive: true });
    }
    g.__tarexenDb = createClient({ url, authToken: envValue("DATABASE_AUTH_TOKEN") });
  }
  return g.__tarexenDb;
}

export function isLocalDatabase(): boolean {
  const url = envValue("DATABASE_URL");
  return !url || url.startsWith("file:");
}

/** Diagnóstico para el panel: forma del token (nunca su valor) y prueba real de conexión. */
export async function databaseDiagnostics() {
  const url = envValue("DATABASE_URL") ?? "";
  const token = envValue("DATABASE_AUTH_TOKEN") ?? "";
  let host = "";
  try { host = url.startsWith("file:") || !url ? "" : new URL(url).host; } catch { host = "URL inválida"; }

  let payloadKeys: string[] = [];
  try {
    payloadKeys = Object.keys(JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString()));
  } catch { /* no es un JWT */ }
  const kind = !token
    ? "sin token"
    : payloadKeys.includes("org_id")
      ? "token de API de la cuenta (incorrecto: hace falta un token de la base de datos)"
      : payloadKeys.includes("a") || payloadKeys.includes("id")
        ? "token de base de datos"
        : "formato no reconocido";

  let connection = "";
  try {
    await (await db()).execute("SELECT 1");
    connection = "OK";
  } catch (err) {
    connection = String((err as Error).message).slice(0, 160);
  }
  return {
    scheme: url.split(":")[0] || "(vacía)",
    host,
    token: {
      present: Boolean(token),
      length: token.length,
      parts: token ? token.split(".").length : 0,
      suspiciousChars: /[\s()"'<>]/.test(token),
      kind,
    },
    connection,
  };
}

async function seed(c: Client) {
  const { rows } = await c.execute("SELECT COUNT(*) AS n FROM categories");
  if (Number(rows[0].n) === 0) {
    for (const [i, cat] of CATEGORIES.entries()) {
      const res = await c.execute({
        sql: `INSERT INTO categories (slug, name_es, name_en, description_es, description_en, icon, sort)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [cat.slug, cat.name[0], cat.name[1], cat.description[0], cat.description[1], cat.icon, i],
      });
      const id = Number(res.lastInsertRowid);
      const stmts: InStatement[] = [
        ...cat.subs.map(([es, en]) => ({ sql: "INSERT INTO subcategories (category_id, name_es, name_en) VALUES (?, ?, ?)", args: [id, es, en] })),
        ...cat.checks.map(([key, es, en, w], j) => ({
          sql: "INSERT INTO checklist_items (category_id, key, label_es, label_en, weight, sort) VALUES (?, ?, ?, ?, ?, ?)",
          args: [id, key, es, en, w, 100 + j],
        })),
        ...cat.questions.map(([es, en]) => ({ sql: "INSERT INTO example_questions (category_id, text_es, text_en) VALUES (?, ?, ?)", args: [id, es, en] })),
      ];
      if (stmts.length) await c.batch(stmts, "write");
    }
    await c.batch(
      BASE_CHECKS.map(([key, es, en, w], j) => ({
        sql: "INSERT INTO checklist_items (category_id, key, label_es, label_en, weight, sort) VALUES (NULL, ?, ?, ?, ?, ?)",
        args: [key, es, en, w, j],
      })),
      "write",
    );
  }

  const prov = await c.execute("SELECT COUNT(*) AS n FROM provinces");
  if (Number(prov.rows[0].n) === 0) {
    const stmts: InStatement[] = [];
    for (const p of PROVINCES) {
      stmts.push({ sql: "INSERT INTO provinces (code, name) VALUES (?, ?)", args: [p.code, p.name] });
      p.cantons.forEach((name, i) =>
        stmts.push({ sql: "INSERT INTO cantons (code, province_code, name) VALUES (?, ?, ?)", args: [p.code + String(i + 1).padStart(2, "0"), p.code, name] }),
      );
    }
    for (const [pName, cName, parish, kind] of SAMPLE_PARISHES) {
      stmts.push({
        sql: `INSERT OR IGNORE INTO parishes (canton_code, name, kind)
              SELECT c.code, ?, ? FROM cantons c JOIN provinces p ON p.code = c.province_code
              WHERE p.name = ? AND c.name = ?`,
        args: [parish, kind, pName, cName],
      });
    }
    await c.batch(stmts, "write");
  }
}

/** Devuelve el cliente con el esquema y los datos semilla listos. */
export async function db(): Promise<Client> {
  const c = client();
  if (!g.__tarexenReady) {
    g.__tarexenReady = (async () => {
      await c.execute("PRAGMA foreign_keys = ON");
      await c.executeMultiple(SCHEMA);
      await seed(c);
    })().catch((err) => {
      g.__tarexenReady = undefined;
      throw err;
    });
  }
  await g.__tarexenReady;
  return c;
}

/** Convierte filas de libSQL en objetos planos (serializables a componentes cliente). */
export function plain<T>(rs: ResultSet): T[] {
  return rs.rows.map((r) => Object.fromEntries(rs.columns.map((col, i) => [col, r[i]])) as T);
}
