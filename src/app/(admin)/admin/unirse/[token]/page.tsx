import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/roles";
import { findOpenInvitation } from "@/lib/team";
import { JoinForm } from "./JoinForm";

export const metadata = { title: "Unirse al equipo" };
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = /^[A-Za-z0-9_-]{20,64}$/.test(token) ? await findOpenInvitation(token) : null;
  // Justo después de aceptar, la invitación ya está usada y hay sesión: ir al panel.
  if (!invite && (await getSessionUser())) redirect("/admin");

  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: 64, paddingBottom: 64 }}>
      <div className="card">
        <div className="logo" style={{ marginBottom: 16 }}>
          <span className="logo-mark" aria-hidden="true">✦</span> TAREXEN <small>Equipo</small>
        </div>
        {!invite ? (
          <>
            <h1 style={{ fontSize: "1.4rem" }}>Invitación no válida</h1>
            <p className="muted">Este enlace ya se usó, fue anulado o venció. Pide a quien te invitó un enlace nuevo.</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.4rem" }}>Te invitaron al equipo de TAREXEN</h1>
            <p>
              Acceso: <span className="badge badge-brand">{ROLE_INFO[invite.role].label}</span>
            </p>
            <p className="small muted">{ROLE_INFO[invite.role].description}</p>
            <JoinForm token={token} />
          </>
        )}
      </div>
    </main>
  );
}
