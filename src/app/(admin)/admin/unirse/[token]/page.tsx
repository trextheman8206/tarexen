import { adminT, adminTitle } from "@/lib/admin-i18n";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/roles";
import { findOpenInvitation } from "@/lib/team";
import { JoinForm } from "./JoinForm";

export async function generateMetadata() {
  return adminTitle("Unirse al equipo");
}
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const T = await adminT();
  const { token } = await params;
  const invite = /^[A-Za-z0-9_-]{20,64}$/.test(token) ? await findOpenInvitation(token) : null;
  // Justo después de aceptar, la invitación ya está usada y hay sesión: ir al panel.
  if (!invite && (await getSessionUser())) redirect("/admin");

  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: 64, paddingBottom: 64 }}>
      <div className="card">
        <div className="logo" style={{ marginBottom: 16 }}>
          <span className="logo-mark" aria-hidden="true">✦</span> TAREXEN <small>{T("Equipo")}</small>
        </div>
        {!invite ? (
          <>
            <h1 style={{ fontSize: "1.4rem" }}>{T("Invitación no válida")}</h1>
            <p className="muted">{T("Este enlace ya se usó, fue anulado o venció. Pide a quien te invitó un enlace nuevo.")}</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.4rem" }}>{T("Te invitaron al equipo de TAREXEN")}</h1>
            <p>
              {T("Acceso:")} <span className="badge badge-brand">{T(ROLE_INFO[invite.role].label)}</span>
            </p>
            <p className="small muted">{T(ROLE_INFO[invite.role].description)}</p>
            <JoinForm token={token} labels={{ done: T("✓ Acceso creado. Entrando al panel…"), name: T("Tu nombre"), email: "Email", emailHint: T("Lo usarás para ingresar al panel."), password: T("Crea una contraseña"), passwordHint: T("Mínimo 10 caracteres."), repeat: T("Repite la contraseña"), pending: T("Creando acceso…"), submit: T("Crear mi acceso") }} />
          </>
        )}
      </div>
    </main>
  );
}
