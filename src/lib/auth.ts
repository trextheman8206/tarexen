import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SITE } from "@/config/site";
import { envValue } from "./env";
import { can, type Perm, type Role } from "./roles";
import { authenticateMember, getActiveMember } from "./team";

const COOKIE = "tx_admin";
const MAX_AGE_S = 60 * 60 * 12;

const adminPassword = () => envValue("ADMIN_PASSWORD");
const sessionSecret = () => envValue("SESSION_SECRET");
const ownerEmail = () => (envValue("OWNER_EMAIL") || SITE.email || "").toLowerCase();

export type SessionUser = { id: "owner" | number; name: string; email: string; role: Role };

export function adminConfigured(): boolean {
  const secret = sessionSecret();
  return Boolean(adminPassword() && secret && secret.length >= 32);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()!).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Comparar hashes de igual longitud evita filtrar la longitud del secreto.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Dueño: contraseña ADMIN_PASSWORD (con su email o el email vacío).
 * Equipo: email + contraseña propia creada al aceptar la invitación.
 */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  if (!adminConfigured()) return null;
  const e = email.trim().toLowerCase();
  if ((!e || e === ownerEmail()) && safeEqual(password.trim(), adminPassword()!)) {
    return { id: "owner", name: ownerEmail() || "Dueño", email: ownerEmail(), role: "dueno" };
  }
  if (!e) return null;
  const m = await authenticateMember(e, password);
  return m ? { id: m.id, name: m.name, email: m.email, role: m.role } : null;
}

export async function startSession(userId: "owner" | number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Usuario de la sesión actual, o null. Los miembros desactivados pierden el acceso al instante. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!adminConfigured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payload = raw.slice(0, i);
  if (!safeEqual(raw.slice(i + 1), sign(payload))) return null;
  const [who, expStr] = payload.split(".");
  if (!(Number(expStr) > Date.now() / 1000)) return null;
  if (who === "owner") return { id: "owner", name: ownerEmail() || "Dueño", email: ownerEmail(), role: "dueno" };
  const id = Number(who);
  if (!Number.isInteger(id) || id <= 0) return null;
  const m = await getActiveMember(id);
  return m ? { id: m.id, name: m.name, email: m.email, role: m.role } : null;
}

/** Para páginas y acciones del panel: exige sesión. */
export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/admin/login");
  return u;
}

/** Exige sesión y un permiso concreto; si falta, vuelve al resumen con un aviso. */
export async function requirePerm(perm: Perm): Promise<SessionUser> {
  const u = await requireUser();
  if (!can(u.role, perm)) redirect("/admin?sin-permiso=1");
  return u;
}

export function actorLabel(u: SessionUser): string {
  return u.id === "owner" ? "dueño" : `${u.name} <${u.email}>`;
}
