import { SITE } from "@/config/site";
import { requirePerm } from "@/lib/auth";
import { INVITABLE_ROLES, ROLE_INFO, type Role } from "@/lib/roles";
import { INVITE_DAYS, listInvitations, listMembers } from "@/lib/team";
import { createInviteAction, revokeInviteAction, updateMemberAction } from "../../actions";
import { CopyLink } from "./CopyLink";

export const metadata = { title: "Equipo" };

function inviteStatus(i: { used_at: string | null; revoked_at: string | null; expires_at: string }) {
  if (i.used_at) return ["Usada", "badge-ok"] as const;
  if (i.revoked_at) return ["Anulada", ""] as const;
  if (i.expires_at < new Date().toISOString().replace("T", " ").slice(0, 19)) return ["Vencida", ""] as const;
  return ["Pendiente", "badge-warn"] as const;
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ nueva?: string }> }) {
  await requirePerm("team.manage");
  const sp = await searchParams;
  const [members, invites] = await Promise.all([listMembers(), listInvitations()]);
  const newLink = sp.nueva && /^[A-Za-z0-9_-]{20,64}$/.test(sp.nueva) ? `${SITE.url}/admin/unirse/${sp.nueva}` : null;
  const roleLabel = (r: string) => ROLE_INFO[r as Role]?.label ?? r;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Equipo</h1>
          <p className="muted" style={{ margin: 0 }}>Invita a personas con acceso limitado según su trabajo. Tú (dueño) siempre tienes acceso total.</p>
        </div>
      </div>

      {newLink && (
        <div className="card" style={{ borderColor: "var(--brand)" }}>
          <h2>Enlace de invitación creado</h2>
          <p className="small">Envíalo por WhatsApp o email a la persona. Funciona <b>una sola vez</b> y vence en {INVITE_DAYS} días. <b>Cópialo ahora</b>: por seguridad no se vuelve a mostrar.</p>
          <CopyLink url={newLink} />
        </div>
      )}

      <form action={createInviteAction} className="card">
        <h2>Invitar a alguien</h2>
        <div className="row-2">
          <div className="field">
            <label htmlFor="role">Tipo de acceso</label>
            <select id="role" name="role" defaultValue="auditor">
              {INVITABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_INFO[r].label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="note">Nota (para ti)</label>
            <input id="note" name="note" type="text" placeholder="Ej.: María, auditora en Otavalo" />
          </div>
        </div>
        <ul className="small muted" style={{ marginTop: 0 }}>
          {INVITABLE_ROLES.map((r) => <li key={r}><b>{ROLE_INFO[r].label}:</b> {ROLE_INFO[r].description}</li>)}
        </ul>
        <button className="btn btn-primary btn-sm">Crear enlace de invitación</button>
      </form>

      <div className="card">
        <h2>Miembros</h2>
        {members.length === 0 ? <p className="muted">Todavía no hay nadie más en el equipo.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Acceso</th><th>Estado</th><th>Último ingreso</th><th></th></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={`${m.id}|${m.role}|${m.active}`}>
                    <td>{m.name}<div className="small muted">{m.email}</div></td>
                    <td>
                      <form action={updateMemberAction} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="id" value={m.id} />
                        <select name="role" defaultValue={m.role} aria-label={`Acceso de ${m.name}`}>
                          {INVITABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_INFO[r].label}</option>)}
                        </select>
                        <button className="btn btn-ghost btn-sm">Cambiar</button>
                      </form>
                    </td>
                    <td>{m.active ? <span className="badge badge-ok">Activo</span> : <span className="badge">Desactivado</span>}</td>
                    <td className="small">{m.last_login_at?.slice(0, 16) ?? "—"}</td>
                    <td>
                      <form action={updateMemberAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="active" value={m.active ? "0" : "1"} />
                        <button className={`btn btn-sm ${m.active ? "btn-danger" : "btn-ghost"}`}>{m.active ? "Quitar acceso" : "Reactivar"}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Invitaciones</h2>
        {invites.length === 0 ? <p className="muted">No has creado invitaciones.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Acceso</th><th>Nota</th><th>Creada</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {invites.map((i) => {
                  const [label, cls] = inviteStatus(i);
                  return (
                    <tr key={i.id}>
                      <td>{roleLabel(i.role)}</td>
                      <td className="small">{i.note || "—"}</td>
                      <td className="small">{i.created_at.slice(0, 10)}</td>
                      <td className="small">{i.expires_at.slice(0, 10)}</td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td>
                        {label === "Pendiente" && (
                          <form action={revokeInviteAction}>
                            <input type="hidden" name="id" value={i.id} />
                            <button className="btn btn-danger btn-sm">Anular</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
