import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db, plain } from "./db";
import type { Role } from "./roles";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export type TeamMember = {
  id: number; name: string; email: string; role: Exclude<Role, "dueno">; active: number;
  invited_by: string; created_at: string; last_login_at: string | null;
};
export type Invitation = {
  id: number; role: Exclude<Role, "dueno">; note: string; created_by: string; created_at: string;
  expires_at: string; used_at: string | null; used_by_member_id: number | null; revoked_at: string | null;
};

export const INVITE_DAYS = 7;
export const MIN_PASSWORD = 10;

// ---------- Contraseñas (scrypt con sal aleatoria) ----------

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(pw, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

// Solo se guarda el hash del token: si alguien lee la base, no puede usar las invitaciones.
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

// ---------- Miembros ----------

export async function listMembers() {
  const c = await db();
  return plain<TeamMember>(await c.execute(
    "SELECT id, name, email, role, active, invited_by, created_at, last_login_at FROM team_members ORDER BY active DESC, created_at",
  ));
}

export async function getActiveMember(id: number) {
  const c = await db();
  return plain<TeamMember>(await c.execute({
    sql: "SELECT id, name, email, role, active, invited_by, created_at, last_login_at FROM team_members WHERE id = ? AND active = 1",
    args: [id],
  }))[0] ?? null;
}

/** Devuelve el miembro si email y contraseña coinciden y está activo. */
export async function authenticateMember(email: string, password: string) {
  const c = await db();
  const row = plain<TeamMember & { password_hash: string }>(await c.execute({
    sql: "SELECT * FROM team_members WHERE email = ? AND active = 1",
    args: [email.trim()],
  }))[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) return null;
  await c.execute({ sql: "UPDATE team_members SET last_login_at = datetime('now') WHERE id = ?", args: [row.id] });
  return row;
}

export async function updateMember(id: number, fields: { role?: Exclude<Role, "dueno">; active?: boolean }) {
  const c = await db();
  if (fields.role) await c.execute({ sql: "UPDATE team_members SET role = ? WHERE id = ?", args: [fields.role, id] });
  if (fields.active !== undefined) await c.execute({ sql: "UPDATE team_members SET active = ? WHERE id = ?", args: [fields.active ? 1 : 0, id] });
}

// ---------- Invitaciones ----------

export async function createInvitation(role: Exclude<Role, "dueno">, note: string, createdBy: string) {
  const token = randomBytes(24).toString("base64url");
  const c = await db();
  await c.execute({
    sql: `INSERT INTO invitations (token_hash, role, note, created_by, expires_at)
          VALUES (?, ?, ?, ?, datetime('now', '+${INVITE_DAYS} days'))`,
    args: [hashToken(token), role, note, createdBy],
  });
  return token;
}

export async function listInvitations() {
  const c = await db();
  return plain<Invitation>(await c.execute(
    "SELECT id, role, note, created_by, created_at, expires_at, used_at, used_by_member_id, revoked_at FROM invitations ORDER BY created_at DESC LIMIT 50",
  ));
}

export async function revokeInvitation(id: number) {
  const c = await db();
  await c.execute({ sql: "UPDATE invitations SET revoked_at = datetime('now') WHERE id = ? AND used_at IS NULL", args: [id] });
}

/** Invitación válida (no usada, no revocada, no vencida) para un token, o null. */
export async function findOpenInvitation(token: string) {
  const c = await db();
  return plain<Invitation>(await c.execute({
    sql: `SELECT id, role, note, created_by, created_at, expires_at, used_at, used_by_member_id, revoked_at
          FROM invitations
          WHERE token_hash = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > datetime('now')`,
    args: [hashToken(token)],
  }))[0] ?? null;
}

export type AcceptResult = { ok: true; memberId: number } | { ok: false; error: "invalid" | "email_taken" };

/** Crea el miembro y marca la invitación como usada, en una sola transacción. */
export async function acceptInvitation(token: string, name: string, email: string, password: string): Promise<AcceptResult> {
  const invite = await findOpenInvitation(token);
  if (!invite) return { ok: false, error: "invalid" };
  const c = await db();
  const taken = await c.execute({ sql: "SELECT 1 FROM team_members WHERE email = ?", args: [email] });
  if (taken.rows.length) return { ok: false, error: "email_taken" };
  const hash = await hashPassword(password);
  const tx = await c.transaction("write");
  try {
    const ins = await tx.execute({
      sql: "INSERT INTO team_members (name, email, password_hash, role, invited_by) VALUES (?, ?, ?, ?, ?)",
      args: [name, email, hash, invite.role, invite.created_by],
    });
    const memberId = Number(ins.lastInsertRowid);
    const upd = await tx.execute({
      sql: "UPDATE invitations SET used_at = datetime('now'), used_by_member_id = ? WHERE id = ? AND used_at IS NULL",
      args: [memberId, invite.id],
    });
    if (upd.rowsAffected !== 1) {
      await tx.rollback();
      return { ok: false, error: "invalid" };
    }
    await tx.commit();
    return { ok: true, memberId };
  } catch (err) {
    await tx.rollback();
    throw err;
  } finally {
    tx.close();
  }
}
