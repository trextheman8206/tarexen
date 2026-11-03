import { adminT, adminTitle } from "@/lib/admin-i18n";
import { redirect } from "next/navigation";
import { adminConfigured, getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export async function generateMetadata() {
  return adminTitle("Ingresar");
}
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const T = await adminT();
  if (await getSessionUser()) redirect("/admin");
  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <div className="card">
        <div className="logo" style={{ marginBottom: 16 }}>
          <span className="logo-mark" aria-hidden="true">✦</span> TAREXEN <small>Panel</small>
        </div>
        {!adminConfigured() && (
          <p className="alert alert-warn small">
            {T("Panel sin configurar. Define ADMIN_PASSWORD y SESSION_SECRET (32+ caracteres) en .env.local y reinicia el servidor.")}
          </p>
        )}
        <LoginForm labels={{ email: "Email", emailHint: T("El dueño puede dejarlo vacío."), password: T("Contraseña"), submit: T("Ingresar"), pending: T("Ingresando…") }} />
      </div>
    </main>
  );
}
