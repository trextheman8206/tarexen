import "server-only";
import { cookies } from "next/headers";
import EN from "./admin-en.json";

// El panel se escribe en español; las claves del diccionario son el texto en español.
// Para traducir un texto nuevo: envolverlo en T("...") y agregarlo a admin-en.json.
// Si falta una traducción, se muestra el español en vez de fallar.

export const ADMIN_LANG_COOKIE = "tx_admin_lang";
export type AdminLang = "es" | "en";
export type AdminT = ((key: string, vars?: Record<string, string | number>) => string) & { lang: AdminLang };

const dict = EN as Record<string, string>;

export async function adminLang(): Promise<AdminLang> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "en" ? "en" : "es";
}

export async function adminT(): Promise<AdminT> {
  const lang = await adminLang();
  const T = ((key, vars) => {
    const text = lang === "en" ? dict[key] ?? key : key;
    return vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;
  }) as AdminT;
  T.lang = lang;
  return T;
}

/** Título de pestaña traducido, para generateMetadata. */
export async function adminTitle(key: string) {
  return { title: (await adminT())(key) };
}
