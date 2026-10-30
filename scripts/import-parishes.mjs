// Importa parroquias desde un CSV (p. ej. exportado del DPA oficial del INEC).
// Uso:  node scripts/import-parishes.mjs ruta/al/archivo.csv
// Columnas requeridas (cabecera): provincia,canton,parroquia   — opcional: tipo (urbana|rural)
// Empareja provincia y cantón por NOMBRE (sin tildes ni mayúsculas). Ejecuta la app
// una vez antes para que existan las tablas.
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/import-parishes.mjs archivo.csv");
  process.exit(1);
}

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === ";") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

const db = createClient({ url: process.env.DATABASE_URL || "file:data/tarexen.db", authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
const [header, ...data] = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
const idx = Object.fromEntries(header.map((h, i) => [norm(h), i]));
for (const col of ["PROVINCIA", "CANTON", "PARROQUIA"]) {
  if (idx[col] === undefined) { console.error(`Falta la columna "${col.toLowerCase()}"`); process.exit(1); }
}

const cantons = (await db.execute("SELECT c.code, c.name AS canton, p.name AS province FROM cantons c JOIN provinces p ON p.code = c.province_code")).rows;
const byName = new Map(cantons.map((r) => [`${norm(String(r.province))}|${norm(String(r.canton))}`, String(r.code)]));

let inserted = 0;
const unmatched = new Set();
const stmts = [];
for (const r of data) {
  const key = `${norm(r[idx.PROVINCIA] ?? "")}|${norm(r[idx.CANTON] ?? "")}`;
  const code = byName.get(key);
  const name = (r[idx.PARROQUIA] ?? "").trim();
  if (!code) { unmatched.add(key); continue; }
  if (!name) continue;
  const tipoRaw = idx.TIPO !== undefined ? norm(r[idx.TIPO] ?? "") : "";
  const kind = tipoRaw.startsWith("URB") ? "urbana" : "rural";
  stmts.push({ sql: "INSERT OR IGNORE INTO parishes (canton_code, name, kind) VALUES (?, ?, ?)", args: [code, name, kind] });
}
for (let i = 0; i < stmts.length; i += 200) {
  const res = await db.batch(stmts.slice(i, i + 200), "write");
  inserted += res.reduce((n, r) => n + r.rowsAffected, 0);
}
console.log(`Parroquias nuevas: ${inserted} (de ${stmts.length} filas válidas).`);
if (unmatched.size) console.warn(`Sin coincidencia de provincia|cantón (${unmatched.size}):`, [...unmatched].slice(0, 20).join("; "));
